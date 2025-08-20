"use client";
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileAudio, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const validateFile = file => {
    const validTypes = ["audio/m4a", "audio/mp4", "audio/x-m4a"]
    const maxSize = 25 * 1024 * 1024 // 25MB (Whisper API limit)

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".m4a")) {
      alert("Please upload only M4A audio files.")
      return false
    }

    if (file.size > maxSize) {
      alert("File size must be less than 25MB (OpenAI Whisper API limit).")
      return false
    }

    return true
  }

  const formatFileSize = bytes => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const processFileWithAPI = async (fileId, file) => {
    try {
      // Step 1: Get presigned upload URL
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "preparing", progress: 5 } : f)
      )

      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'audio/m4a'
        }),
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to get upload URL')
      }

      // Step 2: Upload directly to R2
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "uploading", progress: 20 } : f)
      )

      const r2Response = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'audio/m4a'
        },
      })

      if (!r2Response.ok) {
        throw new Error('Failed to upload file to storage')
      }

      // Step 3: Create transcription job
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "creating_job", progress: 40 } : f)
      )

      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectKey: uploadData.objectKey,
          fileName: file.name,
          source: 'web'
        }),
      })

      const jobData = await jobResponse.json()

      if (!jobResponse.ok) {
        throw new Error(jobData.error || 'Failed to create transcription job')
      }

      // Step 4: Poll for job completion
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { 
          ...f, 
          status: "processing", 
          progress: 50, 
          jobId: jobData.jobId 
        } : f)
      )

      // Start polling for job status
      pollJobStatus(fileId, jobData.jobId)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error.message || 'Network error. Please try again.',
              }
            : f
        )
      )
    }
  }

  const pollJobStatus = async (fileId, jobId) => {
    const MAX_POLLING_TIME = 10 * 60 * 1000 // 10 minutes timeout
    const POLL_INTERVAL = 2000 // 2 seconds
    let pollCount = 0
    const maxPollCount = MAX_POLLING_TIME / POLL_INTERVAL

    const poll = async () => {
      pollCount++
      
      // Check if we've exceeded the maximum polling time
      if (pollCount >= maxPollCount) {
        console.warn(`Polling timeout for job ${jobId} after ${MAX_POLLING_TIME / 1000} seconds`)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: "Transcription timed out after 10 minutes. Please try again.",
                }
              : f
          )
        )
        return // Stop polling
      }
      
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const jobStatus = await response.json()

        if (!response.ok) {
          throw new Error(jobStatus.error || 'Failed to get job status')
        }

        // Update progress
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  progress: jobStatus.progress || 50,
                }
              : f
          )
        )

        if (jobStatus.status === 'completed') {
          // Download transcript
          const transcriptResponse = await fetch(`/api/transcripts/${jobId}`)
          const transcriptText = await transcriptResponse.text()

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "completed",
                    progress: 100,
                    transcription: transcriptText,
                    jobId: jobId,
                  }
                : f
            )
          )
        } else if (jobStatus.status === 'error') {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "error",
                    progress: 0,
                    error: jobStatus.error?.message || 'Transcription failed',
                  }
                : f
            )
          )
        } else {
          // Continue polling if still processing
          setTimeout(poll, POLL_INTERVAL)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: 'Failed to get transcription status',
                }
              : f
          )
        )
      }
    }

    // Start polling
    setTimeout(poll, 1000)
  }

  const processFiles = (files) => {
    const fileArray = Array.from(files)

    fileArray.forEach((file) => {
      if (validateFile(file)) {
        const fileId = Math.random().toString(36).substr(2, 9)
        const uploadedFile = {
          file,
          id: fileId,
          status: "preparing",
          progress: 0,
        }

        setUploadedFiles((prev) => [...prev, uploadedFile])
        processFileWithAPI(fileId, file)
      }
    })
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    processFiles(files)
  }, [])

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files) {
      processFiles(files)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }


  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileAudio className="h-4 w-4 text-blue-500" />;
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "preparing":
        return "Getting upload URL...";
      case "uploading":
        return "Uploading to cloud storage...";
      case "creating_job":
        return "Creating transcription job...";
      case "processing":
        return "Transcribing with AI...";
      case "completed":
        return "Transcription completed"
      case "error":
        return "Error occurred"
      default:
        return "Preparing..."
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragOver ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        <CardContent
          className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className={`rounded-full p-4 mb-4 transition-colors ${
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
            <Upload className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-semibold mb-2">
            {isDragOver ? "Drop your M4A files here" : "Upload M4A Audio Files"}
          </h3>

          <p className="text-muted-foreground mb-6 max-w-sm">
            Drag and drop your M4A files here, or click to browse and select files from your device.
          </p>

          <Button onClick={() => fileInputRef.current?.click()} size="lg" className="mb-4">
            <Upload className="mr-2 h-4 w-4" />
            Choose Files
          </Button>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">M4A files only</Badge>
            <Badge variant="secondary">Max 25MB per file</Badge>
            <Badge variant="secondary">Multiple files supported</Badge>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".m4a,audio/m4a,audio/mp4,audio/x-m4a"
            multiple
            onChange={handleFileSelect}
            className="hidden" />
        </CardContent>
      </Card>
      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Processing Files</h3>

          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIcon(uploadedFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(uploadedFile.file.size)}</span>
                        {uploadedFile.duration && <span>Duration: {uploadedFile.duration}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Loading Indicator */}
                {uploadedFile.status !== "completed" && uploadedFile.status !== "error" && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {getStatusText(uploadedFile.status)}
                    </p>
                  </div>
                )}

                {/* Error Display */}
                {uploadedFile.status === "error" && uploadedFile.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <p className="font-medium text-sm text-red-700">Error</p>
                    </div>
                    <p className="text-sm text-red-600">{uploadedFile.error}</p>
                  </div>
                )}

                {/* Transcription Preview */}
                {uploadedFile.transcription && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">Transcription:</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([uploadedFile.transcription], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `${uploadedFile.file.name}_transcription.txt`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                      >
                        Download Full Text
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uploadedFile.transcription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

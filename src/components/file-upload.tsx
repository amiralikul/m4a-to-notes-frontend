"use client";
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileAudio, X, CheckCircle, AlertCircle, Loader2, Download, RotateCcw } from "lucide-react"

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

  const validateFile = useCallback((file) => {
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
  }, [])

  const formatFileSize = bytes => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const processFileWithAPI = useCallback(async (fileId, file) => {
    try {
      // Single upload and process request
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "uploading", progress: 10 } : f)
      )

      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch('/api/upload-and-process', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload and process file')
      }

      // Update with job ID and start polling
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { 
          ...f, 
          status: "processing", 
          progress: 20, 
          jobId: result.jobId 
        } : f)
      )

      // Start polling for job status
      pollJobStatus(fileId, result.jobId)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error.message || 'Failed to upload file. Please try again.',
              }
            : f
        )
      )
    }
  }, [])

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

  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files)

    fileArray.forEach((file) => {
      if (validateFile(file)) {
        const fileId = Math.random().toString(36).substr(2, 9)
        const uploadedFile = {
          file,
          id: fileId,
          status: "uploading",
          progress: 0,
        }

        setUploadedFiles((prev) => [...prev, uploadedFile])
        processFileWithAPI(fileId, file)
      }
    })
  }, [validateFile, processFileWithAPI])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    processFiles(files)
  }, [processFiles])

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files) {
      processFiles(files)
    }
    // Clear the input value to allow selecting the same file again
    e.target.value = ''
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const retryFile = useCallback((fileId) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: "uploading",
              progress: 0,
              error: undefined,
              transcription: undefined,
              jobId: undefined,
            }
          : f
      )
    )
    
    // Find the file and restart processing
    const fileToRetry = uploadedFiles.find((f) => f.id === fileId)
    if (fileToRetry) {
      processFileWithAPI(fileId, fileToRetry.file)
    }
  }, [uploadedFiles, processFileWithAPI])


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
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed"
      case "error":
        return "Error occurred"
      default:
        return "Preparing..."
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 relative overflow-hidden rounded-2xl ${
          isDragOver 
            ? "border-blue-400 bg-blue-50/50 scale-[1.02] shadow-lg" 
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-md"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="relative flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className={`rounded-2xl p-6 mb-6 transition-all duration-300 ${
            isDragOver 
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl scale-110" 
              : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100"
          }`}>
            <Upload className={`h-10 w-10 transition-colors ${!isDragOver ? 'text-gray-600' : ''}`} />
          </div>

          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {isDragOver ? "Drop your M4A files here" : "Upload M4A Audio Files"}
          </h3>

          <p className="text-gray-600 mb-8 max-w-lg leading-relaxed text-lg">
            Drag and drop your M4A files here, or click to browse and select files from your device.
          </p>

          <Button 
            onClick={() => fileInputRef.current?.click()} 
            size="lg" 
            className="mb-8 h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Upload className="mr-3 h-5 w-5" />
            Choose Files
          </Button>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700 px-4 py-2">
              <FileAudio className="w-3 h-3 mr-2" />
              M4A files only
            </Badge>
            <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700 px-4 py-2">
              <CheckCircle className="w-3 h-3 mr-2" />
              Max 25MB per file
            </Badge>
            <Badge variant="outline" className="bg-white/80 border-purple-200 text-purple-700 px-4 py-2">
              <Upload className="w-3 h-3 mr-2" />
              Multiple files supported
            </Badge>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Processing Files
            </h3>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
            </Badge>
          </div>

          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(uploadedFile.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg text-gray-900 truncate">{uploadedFile.file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <FileAudio className="w-3 h-3 mr-1" />
                          {formatFileSize(uploadedFile.file.size)}
                        </span>
                        {uploadedFile.duration && <span>Duration: {uploadedFile.duration}</span>}
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFile(uploadedFile.id)}
                    className="opacity-60 hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar for Processing Files */}
                {uploadedFile.status !== "completed" && uploadedFile.status !== "error" && (
                  <div className="space-y-3 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-sm animate-shimmer"
                        style={{ width: `${uploadedFile.progress || 5}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <p className="text-sm font-medium text-blue-700">
                        {getStatusText(uploadedFile.status)}
                      </p>
                      <span className="text-sm text-gray-500">
                        {uploadedFile.progress || 0}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {uploadedFile.status === "error" && uploadedFile.error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="font-semibold text-red-700">Processing Error</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white hover:bg-red-50 border-red-300 text-red-700 hover:text-red-800"
                        onClick={() => retryFile(uploadedFile.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                    <p className="text-sm text-red-600 leading-relaxed">{uploadedFile.error}</p>
                  </div>
                )}

                {/* Transcription Preview */}
                {uploadedFile.transcription && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="font-semibold text-green-800">Transcription Complete</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white hover:bg-green-50 border-green-300 text-green-700 hover:text-green-800"
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
                        <Download className="w-4 h-4 mr-2" />
                        Download Full Text
                      </Button>
                    </div>
                    <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
                        {uploadedFile.transcription}
                      </p>
                    </div>
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

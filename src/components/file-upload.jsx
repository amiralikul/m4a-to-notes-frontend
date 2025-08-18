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
      // Update status to uploading
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "uploading", progress: 10 } : f)
      )

      const formData = new FormData()
      formData.append('audio', file)

      // Update to processing
      setUploadedFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "processing", progress: 50 } : f)
      )

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        // Success
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "completed",
                  progress: 100,
                  transcription: result.transcription,
                  requestId: result.requestId,
                  timestamp: result.timestamp,
                }
              : f
          )
        )
      } else {
        // Error from API
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: result.error || 'Failed to process audio file',
                }
              : f
          )
        )
      }
    } catch (error) {
      // Network or other error
      console.error('Upload error:', error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: 'Network error. Please try again.',
              }
            : f
        )
      )
    }
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
      case "uploading":
        return "Uploading audio file...";
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

import { useState, useCallback } from "react"
import { googleDriveService } from "@/services/googleDriveService"
import { DRIVE_STATUS } from "@/constants/googleDrive"

export function useGoogleDrive(brandId) {
  const [status, setStatus] = useState(DRIVE_STATUS.IDLE)
  const [files, setFiles] = useState([])
  const [account, setAccount] = useState(null)
  const [error, setError] = useState(null)

  const fetchFiles = useCallback(async () => {
    if (!brandId) return
    setStatus(DRIVE_STATUS.LOADING)
    setError(null)
    try {
      const context = await googleDriveService.getFiles(brandId)
      setFiles(context?.data || [])
      setAccount(context?.account || null)
      setStatus(context?.connected ? DRIVE_STATUS.CONNECTED : DRIVE_STATUS.NOT_CONNECTED)
    } catch (err) {
      setError(err)
      setStatus(DRIVE_STATUS.ERROR)
    }
  }, [brandId])

  const connect = useCallback(async () => {
    if (!brandId) return
    try {
      const url = await googleDriveService.getAuthUrl(brandId)
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err)
    }
  }, [brandId])

  const downloadFile = useCallback(
    (fileId, fileName) => googleDriveService.downloadFile(brandId, fileId, fileName),
    [brandId]
  )

  return {
    status,
    files,
    account,
    error,
    fetchFiles,
    connect,
    downloadFile,
    DRIVE_STATUS,
  }
}

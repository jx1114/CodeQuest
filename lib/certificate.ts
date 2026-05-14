function toSafeFilenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getCertificateFilename(userName: string, languageName: string) {
  const userPart = toSafeFilenamePart(userName || "codequest-user")
  const languagePart = toSafeFilenamePart(languageName || "certificate")
  return `codequest-certificate-${languagePart}-${userPart}.svg`
}

export function downloadCertificateSvg(svgElement: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer()
  let svgSource = serializer.serializeToString(svgElement)

  if (!svgSource.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgSource = svgSource.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  const blob = new Blob([svgSource], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
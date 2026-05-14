param(
  [Parameter(Mandatory = $true)]
  [string]$ThemeId,
  [Parameter(Mandatory = $true)]
  [int]$StartParagraph,
  [Parameter(Mandatory = $true)]
  [int]$EndParagraph,
  [string]$ExportTag = "20260507-word-test"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sourceDocx = Join-Path $root "exports\main-theme-overviews\s1-1-1-source.docx"
$outputDir = Join-Path $root "exports\main-theme-overviews"

if (-not (Test-Path -LiteralPath $sourceDocx)) {
  throw "Missing source docx: $sourceDocx"
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$word = $null
$sourceDoc = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $sourceDoc = $word.Documents.Open($sourceDocx, $false, $true)

  $startPara = $sourceDoc.Paragraphs.Item($StartParagraph)
  $endPara = $sourceDoc.Paragraphs.Item($EndParagraph)
  $copyRange = $sourceDoc.Range($startPara.Range.Start, $endPara.Range.Start)

  $targetDoc = $word.Documents.Add()
  try {
    $targetDoc.Range(0, 0).FormattedText = $copyRange.FormattedText

    $docxPath = Join-Path $outputDir ("{0}-{1}.docx" -f $ThemeId, $ExportTag)
    $pdfPath = Join-Path $outputDir ("{0}-{1}.pdf" -f $ThemeId, $ExportTag)

    if (Test-Path -LiteralPath $docxPath) {
      Remove-Item -LiteralPath $docxPath -Force
    }
    if (Test-Path -LiteralPath $pdfPath) {
      Remove-Item -LiteralPath $pdfPath -Force
    }

    $targetDoc.SaveAs2($docxPath, 16)
    $targetDoc.ExportAsFixedFormat($pdfPath, 17)

    Write-Output $docxPath
    Write-Output $pdfPath
  }
  finally {
    $targetDoc.Close([ref]$false)
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($targetDoc)
  }
}
finally {
  if ($sourceDoc -ne $null) {
    $sourceDoc.Close([ref]$false)
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($sourceDoc)
  }
  if ($word -ne $null) {
    $word.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

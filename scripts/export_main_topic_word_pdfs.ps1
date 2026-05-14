$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sourceDocx = Join-Path $root "exports\main-theme-overviews\s1-1-1-source.docx"
$outputDir = Join-Path $root "exports\main-theme-overviews"
$exportTag = "20260507-word-v1"

$themes = @(
  @{ Id = "s1-1-1-main-theme-rational";   StartParagraph = 5;  EndParagraph = 17 },
  @{ Id = "s1-1-1-main-theme-irrational"; StartParagraph = 17; EndParagraph = 27 },
  @{ Id = "s1-1-1-main-theme-real-line";  StartParagraph = 27; EndParagraph = 43 },
  @{ Id = "s1-1-1-main-theme-distance";   StartParagraph = 43; EndParagraph = 51 }
)

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

  foreach ($theme in $themes) {
    $startParagraph = $sourceDoc.Paragraphs.Item($theme.StartParagraph)
    $endParagraph = $sourceDoc.Paragraphs.Item($theme.EndParagraph)
    $copyRange = $sourceDoc.Range($startParagraph.Range.Start, $endParagraph.Range.Start)

    $targetDoc = $word.Documents.Add()
    try {
      $targetDoc.Range(0, 0).FormattedText = $copyRange.FormattedText
      $outputPath = Join-Path $outputDir ("{0}-original-{1}.pdf" -f $theme.Id, $exportTag)
      if (Test-Path -LiteralPath $outputPath) {
        Remove-Item -LiteralPath $outputPath -Force
      }
      $targetDoc.ExportAsFixedFormat($outputPath, 17)
      Write-Output $outputPath
    }
    finally {
      $targetDoc.Close([ref]$false)
      [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($targetDoc)
    }
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

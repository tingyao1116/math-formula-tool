$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Root = "C:\codex資料夾\數學公式使用工具\exports\j1-second-volume-outline"
$OutputName = "國一下_易讀版分頁版_主題大綱版"

$utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false
$pageBreakLines = @(
    '```{=openxml}',
    '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
    '```'
)
$pageBreak = [string]::Join("`n", $pageBreakLines)

$units = @(
    @{
        Folder = "改國一下1_二元一次聯立方程式_整理"
        File = "改國一下1_二元一次聯立方程式_易讀版.md"
        Number = 1
        Title = "二元一次聯立方程式"
    },
    @{
        Folder = "改國一下2_二元一次方程式的圖形_整理"
        File = "改國一下2_二元一次方程式的圖形_易讀版.md"
        Number = 2
        Title = "二元一次方程式的圖形"
    },
    @{
        Folder = "改國一下3_比與比例式_整理"
        File = "改國一下3_比與比例式_易讀版.md"
        Number = 3
        Title = "比與比例式"
    },
    @{
        Folder = "改國一下4_函數與其圖形_整理"
        File = "改國一下4_函數與其圖形_易讀版.md"
        Number = 4
        Title = "函數與其圖形"
    },
    @{
        Folder = "改國一下5_一元一次不等式_整理"
        File = "改國一下5_一元一次不等式_易讀版.md"
        Number = 5
        Title = "一元一次不等式"
    }
)

function Read-Utf8File {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Utf8File {
    param(
        [string]$Path,
        [string]$Content
    )

    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Clean-Text {
    param([string]$Text)

    $text = $Text -replace "`r`n", "`n"
    $text = $text.Trim()
    return $text
}

function Remove-QuotePrefix {
    param([string[]]$Lines)

    if (-not $Lines) {
        return ""
    }

    $cleaned = foreach ($line in $Lines) {
        if ($line -match '^\s*>\s?(.*)$') {
            $matches[1]
        }
        else {
            $line
        }
    }

    return (Clean-Text ($cleaned -join "`n"))
}

function Extract-SectionBody {
    param(
        [string]$Text,
        [string]$Heading
    )

    $escapedHeading = [regex]::Escape($Heading)
    $pattern = "(?ms)^###\s+$escapedHeading\s*\n(.*?)(?=^###\s+|\z)"
    $match = [regex]::Match($Text, $pattern)
    if (-not $match.Success) {
        return ""
    }

    return (Clean-Text $match.Groups[1].Value)
}

function Normalize-TopicHeading {
    param([string]$Heading)

    $cleanHeading = $Heading.Trim()
    $cleanHeading = $cleanHeading -replace '^(主題|重點)\s*\d+\s*[:：]\s*', ''
    return $cleanHeading
}

function Parse-TopicSections {
    param([string]$Text)

    $topicMatches = [regex]::Matches(
        $Text,
        '(?ms)^##\s+(.+?)\s*$\n(.*?)(?=^##\s+|\z)'
    )

    $topics = @()

    foreach ($match in $topicMatches) {
        $rawHeading = $match.Groups[1].Value.Trim()
        if ($rawHeading -in @("章節地圖", "閱讀提醒")) {
            continue
        }

        $body = $match.Groups[2].Value
        $summary = Extract-SectionBody -Text $body -Heading "先抓一句話"
        $keyPoints = Extract-SectionBody -Text $body -Heading "重點整理"
        if (-not $keyPoints) {
            $keyPoints = Clean-Text $body
        }

        $topics += [pscustomobject]@{
            Heading = Normalize-TopicHeading $rawHeading
            Summary = $summary
            KeyPoints = $keyPoints
        }
    }

    return $topics
}

function Get-UnitPageParts {
    param(
        [string]$Text,
        [string]$UnitHeading
    )

    $parts = [ordered]@{
        Intro = ""
        Map = ""
        Reminders = ""
    }

    $unitPattern = "(?ms)^#\s+$([regex]::Escape($UnitHeading))\s*$\n(.*?)(?=^##\s+|\z)"
    $unitMatch = [regex]::Match($Text, $unitPattern)
    if ($unitMatch.Success) {
        $unitBlock = $unitMatch.Groups[1].Value
        $quoteLines = [regex]::Matches($unitBlock, '(?m)^\s*>.*$') | ForEach-Object { $_.Value }
        $parts.Intro = Remove-QuotePrefix $quoteLines
        return $parts
    }

    $topBlockPattern = '(?ms)\A(?:[^\n]*\n){0,2}((?:>\s?.*\n)+)'
    $topBlockMatch = [regex]::Match($Text, $topBlockPattern)
    if ($topBlockMatch.Success) {
        $quoteLines = ($topBlockMatch.Groups[1].Value -split "`n") | Where-Object { $_ -match '^\s*>' }
        $parts.Intro = Remove-QuotePrefix $quoteLines
    }

    $mapBody = Extract-SectionBody -Text $Text -Heading "章節地圖"
    if ($mapBody) {
        $parts.Map = $mapBody
    }

    $reminderBody = Extract-SectionBody -Text $Text -Heading "閱讀提醒"
    if ($reminderBody) {
        $parts.Reminders = $reminderBody
    }

    return $parts
}

function Build-UnitMarkdown {
    param(
        [int]$Number,
        [string]$Title,
        [hashtable]$PageParts,
        [object[]]$Topics
    )

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("# 單元$Number $Title")
    $lines.Add("")

    if ($PageParts.Intro) {
        $lines.Add($PageParts.Intro)
        $lines.Add("")
    }

    if ($PageParts.Map) {
        $lines.Add("### 章節大綱")
        $lines.Add("")
        $lines.Add($PageParts.Map)
        $lines.Add("")
    }

    if ($PageParts.Reminders) {
        $lines.Add("### 閱讀提醒")
        $lines.Add("")
        $lines.Add($PageParts.Reminders)
        $lines.Add("")
    }

    for ($i = 0; $i -lt $Topics.Count; $i++) {
        $topic = $Topics[$i]
        $lines.Add($pageBreak)
        $lines.Add("")
        $lines.Add("## $($topic.Heading)")
        $lines.Add("")

        if ($topic.Summary) {
            $lines.Add($topic.Summary)
            $lines.Add("")
        }

        $lines.Add("### 重點整理")
        $lines.Add("")
        $lines.Add($topic.KeyPoints.Trim())
        $lines.Add("")
    }

    return (($lines -join "`n").Trim() + "`n")
}

$mergedUnits = New-Object System.Collections.Generic.List[string]
$unitPageCount = 0
$topicPageCount = 0

foreach ($unit in $units) {
    $folderPath = Join-Path $Root $unit.Folder
    $sourcePath = Join-Path $folderPath $unit.File
    $sourceText = Read-Utf8File $sourcePath

    $pageParts = Get-UnitPageParts -Text $sourceText -UnitHeading "單元$($unit.Number) $($unit.Title)"
    $topics = Parse-TopicSections -Text $sourceText

    $unitMarkdown = Build-UnitMarkdown -Number $unit.Number -Title $unit.Title -PageParts $pageParts -Topics $topics
    $perUnitOutputPath = Join-Path $folderPath ("改國一下{0}_{1}_主題大綱版.md" -f $unit.Number, $unit.Title)
    Write-Utf8File -Path $perUnitOutputPath -Content $unitMarkdown

    $mergedUnits.Add($unitMarkdown.Trim())
    $unitPageCount += 1
    $topicPageCount += $topics.Count
}

$mergedMarkdown = $mergedUnits -join "`n`n$pageBreak`n`n"
$mergedMarkdownPath = Join-Path $Root "$OutputName.md"
Write-Utf8File -Path $mergedMarkdownPath -Content ($mergedMarkdown.Trim() + "`n")

$summary = [pscustomobject]@{
    merged_markdown = $mergedMarkdownPath
    unit_pages = $unitPageCount
    topic_pages = $topicPageCount
    total_expected_pages = $unitPageCount + $topicPageCount
}

$summary | ConvertTo-Json -Depth 3

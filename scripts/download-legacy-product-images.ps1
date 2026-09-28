$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $projectRoot 'src/lib/legacy-products-data.json'
$imagesPath = (Resolve-Path (Join-Path $projectRoot 'public/images')).Path
$rows = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$failures = @()

foreach ($row in $rows) {
  if ($row.id -notmatch '^\d+$') { throw "Invalid product ID in manifest: $($row.id)" }
  $source = [Uri]$row.sourceImage
  if ($source.Scheme -ne 'https' -or $source.Host -ne 'jjglass.com' -or
      -not $source.AbsolutePath.StartsWith('/wp-content/uploads/') -or
      -not $source.AbsolutePath.EndsWith('.jpg')) {
    throw "Unexpected source image URL for product $($row.id)"
  }

  $target = Join-Path $imagesPath "product-$($row.id).jpg"
  if (Test-Path -LiteralPath $target) {
    Write-Output "Existing: $($row.id)"
    continue
  }

  $partial = "$target.part"
  try {
    Invoke-WebRequest -Uri $source.AbsoluteUri -OutFile $partial -TimeoutSec 30 -MaximumRedirection 3
    $bytes = [System.IO.File]::ReadAllBytes($partial)
    if ($bytes.Length -lt 1000 -or $bytes[0] -ne 0xFF -or $bytes[1] -ne 0xD8 -or
        $bytes[$bytes.Length - 2] -ne 0xFF -or $bytes[$bytes.Length - 1] -ne 0xD9) {
      throw "Downloaded file is not a complete JPEG"
    }
    Move-Item -LiteralPath $partial -Destination $target
    Write-Output "Saved: $($row.id) ($($bytes.Length) bytes)"
  }
  catch {
    $failures += "$($row.id): $($_.Exception.Message)"
    Write-Warning $failures[-1]
  }
  finally {
    if (Test-Path -LiteralPath $partial) { Remove-Item -LiteralPath $partial -Force }
  }
}

if ($failures.Count) { throw "$($failures.Count) image downloads failed: $($failures -join '; ')" }

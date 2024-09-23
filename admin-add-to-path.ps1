#adds the freaky executable to the user's PATH

#relative path to executable directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$directoryToAdd = Join-Path $scriptDir "dist"

#only add to path if not already present
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)

if ($currentPath.Split(";") -contains $directoryToAdd) {

    Write-Output "Directory '$directoryToAdd' is already in PATH."

} else {

    [System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$directoryToAdd", [System.EnvironmentVariableTarget]::User)
    Write-Output "Directory '$directoryToAdd' added to PATH. You may need to restart your terminal for changes to take effect."

}
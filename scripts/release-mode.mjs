import { pathToFileURL } from 'node:url'

const manualModes = new Set(['patch', 'minor', 'major', 'current'])

export function resolveReleaseMode(eventName, manualMode, ref) {
  if (ref !== 'refs/heads/main') {
    throw new Error(`Releases are allowed only from main; received ${ref || '(no ref)'}.`)
  }

  if (eventName === 'push') {
    return 'patch'
  }

  if (eventName !== 'workflow_dispatch') {
    throw new Error(`Unsupported release event: ${eventName || '(none)'}.`)
  }

  if (!manualModes.has(manualMode)) {
    throw new Error(`Invalid release mode: ${manualMode || '(empty)'}.`)
  }

  return manualMode
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [, , eventName, manualMode, ref] = process.argv
    process.stdout.write(`${resolveReleaseMode(eventName, manualMode, ref)}\n`)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

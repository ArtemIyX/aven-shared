import { pathToFileURL } from 'node:url'

const releaseEvents = new Set(['push', 'workflow_dispatch'])

export function resolveReleaseMode(eventName, ref) {
  if (ref !== 'refs/heads/main') {
    throw new Error(`Releases are allowed only from main; received ${ref || '(no ref)'}.`)
  }

  if (!releaseEvents.has(eventName)) {
    throw new Error(`Unsupported release event: ${eventName || '(none)'}.`)
  }

  return 'publish'
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [, , eventName, ref] = process.argv
    process.stdout.write(`${resolveReleaseMode(eventName, ref)}\n`)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

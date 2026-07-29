/**
 * OpenAPI schema leaves most response properties without `required`,
 * so openapi-typescript emits almost everything as optional.
 *
 * Before codegen we mark all properties required on non-request schemas.
 * Explicit `nullable: true` stays as `| null`; only `undefined` is removed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = resolve(root, 'openapi.auctions.v0.json')
const outputPath = resolve(root, '.generated/openapi.prepared.json')

function markObjectRequired(schema) {
  if (!schema || typeof schema !== 'object') return

  if (Array.isArray(schema)) {
    schema.forEach(markObjectRequired)
    return
  }

  if (schema.properties && typeof schema.properties === 'object') {
    const keys = Object.keys(schema.properties)
    if (keys.length > 0) {
      schema.required = keys
    }
    for (const value of Object.values(schema.properties)) {
      markObjectRequired(value)
    }
  }

  if (schema.items) markObjectRequired(schema.items)
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    markObjectRequired(schema.additionalProperties)
  }

  for (const key of ['allOf', 'oneOf', 'anyOf']) {
    if (Array.isArray(schema[key])) schema[key].forEach(markObjectRequired)
  }
}

const spec = JSON.parse(readFileSync(inputPath, 'utf8'))

for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
  // Keep request DTOs optional — filters / pagination are partial by design.
  if (name.endsWith('Request')) continue
  markObjectRequired(schema)
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`)
console.log(`Prepared OpenAPI → ${outputPath}`)

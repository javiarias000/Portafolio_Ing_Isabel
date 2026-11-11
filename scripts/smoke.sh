#!/usr/bin/env bash
# Prueba de humo del contenedor. Uso: bash scripts/smoke.sh   (requiere Docker)
set -euo pipefail
IMG=midea-smoke; NAME=midea-smoke-$$; PORT=${PORT:-8080}; U=http://localhost:$PORT
cleanup(){ docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
fail(){ echo "FAIL: $*" >&2; exit 1; }

docker build -t "$IMG" .
docker run -d --name "$NAME" -p "$PORT:80" "$IMG" >/dev/null
for i in $(seq 1 30); do curl -fsS "$U/healthz" >/dev/null 2>&1 && break; sleep 1; done

[ "$(curl -fsS "$U/healthz")" = "ok" ] || fail "/healthz distinto de 'ok'"
H=$(curl -sI "$U/")
echo "$H" | grep -qi '^HTTP/.* 200' || fail "/ no devuelve 200"
echo "$H" | grep -qi '^x-content-type-options: nosniff' || fail "falta X-Content-Type-Options"
echo "$H" | grep -qi '^cache-control:' || fail "falta Cache-Control en /"
echo "$H" | grep -qi '^content-security-policy:' || fail "falta CSP"
CODE=$(curl -s -o /tmp/nope.html -w '%{http_code}' "$U/nope")
[ "$CODE" = 404 ] || fail "/nope devuelve $CODE"
grep -q 'no existe' /tmp/nope.html || fail "/nope no sirve 404.html"
curl -sI -H 'Accept-Encoding: gzip' "$U/" | grep -qi '^content-encoding: gzip' || fail "sin gzip en /"
echo "OK: todas las pruebas de humo pasaron"

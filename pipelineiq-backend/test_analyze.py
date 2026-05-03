"""Quick test of the full analyze pipeline."""
import os, json, traceback

os.environ.setdefault("GEMINI_API_KEY", "AIzaSyBVhl72n7g8FJwaz9Mj0r7jJb6cBfnj54o")

from utils.log_parser import clean_log, chunk_log, summarize_chunks
from utils.llm_engine import analyze_log

raw = """npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! While resolving: my-app@1.0.0
npm ERR! Found: react@18.2.0
npm ERR! Could not resolve dependency:
npm ERR! Conflicting peer dependency: react@16.14.0
npm ERR! Fix the upstream dependency conflict
Process exited with code 1"""

try:
    cleaned = clean_log(raw)
    print(f"Cleaned ({len(cleaned)} chars):", repr(cleaned[:200]))
    
    if not cleaned.strip():
        print("ERROR: clean_log returned empty string! This is the bug.")
    else:
        chunks = chunk_log(cleaned)
        print(f"Chunks: {len(chunks)}")
        final = summarize_chunks(chunks)
        print(f"Final ({len(final)} chars):", repr(final[:200]))
        
        errors = analyze_log(final)
        print(f"\nResult ({len(errors)} errors):")
        print(json.dumps(errors, indent=2))
except Exception as e:
    print(f"EXCEPTION: {type(e).__name__}: {e}")
    traceback.print_exc()

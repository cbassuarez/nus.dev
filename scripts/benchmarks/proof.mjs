// A recorded verifier result, tied to the exact downloadable source bytes.
export function validateProof(p, sourceHash) {
 if(p?.schema!==1 || p.status!=='verified' || p.mutation_rejected!==true ||
    p.verification?.success!==true || p.verification.errors!==0 ||
    p.verification.verified!==3 || p.verification['is-verifying-entire-crate']!==true ||
    p.verification['encountered-error']!==false || p.verification['encountered-vir-error']!==false ||
    p.source_hashes?.['crates/pty/src/ring.rs']!==sourceHash ||
    !p.flags?.includes('--no-cheating') || p.verus?.version!=='0.2026.09.20.aef82ed' ||
    !Array.isArray(p.assumptions) || !Array.isArray(p.excludes)) throw Error('Unverified or stale ring proof');
 return p;
}

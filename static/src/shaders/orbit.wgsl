struct Satellite {
    R: vec3<f32>,
    _pad: f32,
    k_hat: vec3<f32>,
    w: f32,
}

struct Uniforms {
    dt: f32,
    nSat: u32, // number of satellites
    _pad: vec2<f32>,
}

@group(0) @binding(0) var<storage, read_write> satellites: array<Satellite>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

// Rodrigues's rotation formula
fn rotate(v: vec3<f32>, k: vec3<f32>, theta: f32) -> vec3<f32> {
    let cosT = cos(theta);
    let sinT = sin(theta);

    let kv = dot(k,v);
    let kxv = cross(k,v)

    return v*cosT + kxv*sinT + k*kv*(1.0-cosT);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let i = gid.x;

    if (i >= uniforms.nSat) { return; }

    let satellite = satellites[i]
    let theta = satellite.w * uniforms.dt;
    let R_new = rotate(satellite.R, satellite.k_hat, theta)

    satellites[i].R = R_new
}
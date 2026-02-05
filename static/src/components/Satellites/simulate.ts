import { useState, useRef, useEffect } from 'react';
import orbitShaderCode from '../shaders/orbit.wgsl?raw';
import type {SatRec} from './types.d.ts';

interface GPURef {
    device: GPUDevice;
    pipeline: GPUComputePipeline;
    bindGroup: GPUBindGroup;
    satBuf: GPUBuffer;
    uniformBuf: GPUBuffer;
    computeOutputBuf: GPUBuffer;
    nSat: number; // number of satellites
}

export function useGPUSimulation(
    satellites: Array<SatRec>,
    enabled: boolean = true
) {
    const [positions, setPositions] = useState<Float32Array | null>(null);
    const gpuRef = useRef<GPURef | null>(null);

    const _mounted = true;
    const mounted = useRef<boolean>(_mounted);
    
    const _ready = false;
    const ready = useRef<boolean>(_ready);

    useEffect(() => {
        if (!enabled || satellites.length === 0) { return; }

        async function initGPU() {
            if (!navigator.gpu) {
                console.error('WebGPU not supported :(');
                return;
            }

            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                console.error('Error gettine GPU adapter :/');
                return;
            }

            const device = await adapter.requestDevice();
            if (!mounted.current) { return; }

            const shaderModule = device.createShaderModule({
                code: orbitShaderCode,
            });

            const nSat = satellites.length;
            const satData = new Float32Array(nSat*8);

            // Pack satellite data into a buffer for transfer to GPU
            satellites.forEach((sat, _i) => {
                const i = _i*8;

                // R, position
                satData[i + 0] = sat.r.X;
                satData[i + 1] = sat.r.Y;
                satData[i + 2] = sat.r.Z;

                satData[i + 3] = 0; // _pad

                // k_hat, axis (given by w_hat)
                satData[i + 4] = sat.w.X;
                satData[i + 5] = sat.w.Y;
                satData[i + 6] = sat.w.Z;

                // angular speed
                satData[i + 7] = sat.speed;
            });

            const satBuf = device.createBuffer({
                size: satData.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true,
            });

            new Float32Array(satBuf.getMappedRange()).set(satData);
            satBuf.unmap();

            const uniformBuf = device.createBuffer({
                size: 16,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            const computeOutputBuf = device.createBuffer({
                size: satData.byteLength,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });

            const pipeline = device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: shaderModule,
                    entryPoint: 'main',
                },
            });
            
            // As expected by orbit.wgsl
            const bindGroup = device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries: [{
                    binding: 0,
                    resource: { buffer: satBuf },
                }, {
                    binding: 1,
                    resource: {buffer: uniformBuf },
                }]
            });

            if (mounted.current) {
                gpuRef.current = {
                    device,
                    pipeline,
                    bindGroup,
                    satBuf,
                    uniformBuf,
                    computeOutputBuf,
                    nSat,
                };

                const R_0s = new Float32Array(nSat*3);
                satellites.forEach((sat, _i) => {
                    const i = _i*3
                    R_0s[i + 0] = sat.r.X;
                    R_0s[i + 1] = sat.r.Y;
                    R_0s[i + 2] = sat.r.Z;
                });

                setPositions(R_0s);
            }
        }

        initGPU();

        return () => {
            mounted.current = false;
            if (gpuRef.current) {
                gpuRef.current.satBuf.destroy();
                gpuRef.current.uniformBuf.destroy();
                gpuRef.current.computeOutputBuf.destroy();
                gpuRef.current = null;
            }
        };
    }, [satellites, enabled]);

    const step = async(dt: number) => {
        const gpu = gpuRef.current;
        if (!gpu) { 
            ready.current = false;
            return; 
        }

        if (!ready.current) {
            ready.current = true;
        }

        const uniformData = new Float32Array([dt, gpu.nSat, 0, 0]);
        gpu.device.queue.writeBuffer(gpu.uniformBuf, 0, uniformData);

        const commandEncoder = gpu.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(gpu.pipeline);
        passEncoder.setBindGroup(0, gpu.bindGroup);

        // shader defines 64 threads for compute main()
        const nWGs = Math.ceil(gpu.nSat / 64);
        passEncoder.dispatchWorkgroups(nWGs);
        passEncoder.end();

        commandEncoder.copyBufferToBuffer(
            gpu.satBuf,
            gpu.computeOutputBuf,
            gpu.satBuf.size,
        );
        
        gpu.device.queue.submit([commandEncoder.finish()]);
        await gpu.computeOutputBuf.mapAsync(GPUMapMode.READ);
        const res = new Float32Array(gpu.computeOutputBuf.getMappedRange()).slice();
        gpu.computeOutputBuf.unmap();

        const newRs = new Float32Array(gpu.nSat*3);
        for (let i = 0; i < gpu.nSat; i++) {
            newRs[i*3 + 0] = res[i*8 + 0];
            newRs[i*3 + 1] = res[i*8 + 1];
            newRs[i*3 + 2] = res[i*8 + 2];
        }

        setPositions(newRs);
        gpu.device.queue.writeBuffer(gpu.satBuf, 0, res);
    };

    return {
        positions,
        step,
        ready,
    }
}
declare module "charls" {
    export type FrameInfo = {
        width: number;
        height: number;
        bitsPerSample: number;
        componentCount: number;
    }

    export class JpegLSDecoder {
        constructor();
        getEncodedBuffer(encodedSize: number): Uint8Array;
        getDecodedBuffer(): Uint8Array;
        decode(): void;
        getFrameInfo(): FrameInfo;
        getInterleaveMode(): number;
        getNearLossless(): number;
        delete(): void;
    }

    export class JpegLSEncoder {
        constructor();
        getDecodedBuffer(frameInfo: FrameInfo): Uint8Array;
        getEncodedBuffer(): Uint8Array;
        setNearLossless(nearLossless: number): void;
        setInterleaveMode(interleaveMode: number): void;
        encode(): void;
        delete(): void;
    }

    export type CharLS = {
        getVersion(): string;
        JpegLSDecoder: typeof JpegLSDecoder;
        JpegLSEncoder: typeof JpegLSEncoder;
    }

    declare function factory(): Promise<CharLS>;
    export default factory;
}
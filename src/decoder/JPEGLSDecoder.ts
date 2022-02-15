import Decoder from "./Decoder";
import CharLS from "charls";
import { getJpegData } from "./util";

class JPEGLosslessDecoder extends Decoder {
	private jpegs:DataView[] | null = null;

	decode(frameNo: number):Promise<DataView> {
		const { image } = this;
		if (!this.jpegs) {
			this.jpegs = getJpegData(image.data);
		}
		if (!this.jpegs?.length) {
			return Promise.reject(new Error("No JPEG-LS image data"));
		}
		return new Promise((resolve) => {
			CharLS().then((charLS) => {
				const decoder = new charLS.JpegLSDecoder();
				const jpeg = this.jpegs![frameNo];
				const buffer = new Uint8Array(jpeg.buffer, jpeg.byteOffset, jpeg.byteLength);
				const encodedBuffer = decoder.getEncodedBuffer(buffer.length);

				encodedBuffer.set(buffer);
				decoder.decode();

				const decoded = decoder.getDecodedBuffer();
				return resolve(new DataView(decoded));
			});
		});
	}
}

export default JPEGLosslessDecoder;

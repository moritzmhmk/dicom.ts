import Decoder from "./Decoder";
import RLE from "./codecs/rle";
import { getEncapsulatedData } from "./util";

class RLEDecoder extends Decoder {
	private rleData: DataView[] | null = null;

	protected decode(frameNo: number): Promise<DataView> {
		const { image } = this;
		if (!this.rleData) {
			const data = getEncapsulatedData(image.data);
			this.rleData = data.slice(1); // skip the first item - only contains offsets

			// don't decode to planar...just makes render more complex
			// RLE input is the same either way
			if (image.planar) {
				image.planar = false;
			}
		}
		const decompressed = RLE(image, this.rleData[frameNo]);
		return Promise.resolve(decompressed);
	}
}

export default RLEDecoder;

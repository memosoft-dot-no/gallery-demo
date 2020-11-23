import { isIOS } from "tns-core-modules/platform/platform";

export default function setImageObject(
    platform,
    id,
    filename,
    path,
    date,
    uploaded,
    localIdentifier
) {
    let imageObject;
    if (platform == isIOS) {
        imageObject = {
            id,
            filename: "img_" + filename + "_I",
            localIdentifier,
            creationDate: date,
            uploaded
        };
    }
    return imageObject;
}

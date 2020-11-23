import * as imagepicker from "nativescript-imagepicker";
import { isIOS, isAndroid } from "tns-core-modules/platform";
import setImageObject from "./setImageObject";

export default function addImagesFromCameraRoll() {
    let context = imagepicker.create({
        mode: "multiple"
    });
    const addImagesFromCameraRoll = new Promise((resolve, reject) => {
        context
            .authorize()
            .then(function() {
                return context.present();
            })
            .then(selection => {
                let imageObjects = [];
                selection.forEach((selected, i) => {
                    if (isIOS) {
                        // Arguments: platform, id, filename, path, creationDate, uploaded, localIdentifier
                        let imageObject = setImageObject(
                            isIOS,
                            null,
                            new Date().getTime(),
                            null,
                            selected._ios.creationDate,
                            false,
                            selected._ios.localIdentifier
                        );

                        if (
                            imageObject.localIdentifier &&
                            imageObject.creationDate
                        ) {
                            imageObjects.push(imageObject);
                        }
                    }
                });
                resolve(imageObjects);
            })
            .catch(function(e) {
                console.log("Image picker error", e);
                reject();
            });
    });

    return addImagesFromCameraRoll;
}

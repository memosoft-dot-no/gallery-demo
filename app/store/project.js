const getEmptyProjectStructure = () => {
  return {
    images: []
  }
}

export default {
  namespaced: true,
  state: {
    projectId: '',
    project: getEmptyProjectStructure(),
    imagesUploadTasks: []
  },
  mutations: {
    setProjectId(state, projectId) {
      state.projectId = projectId
      this._vm.setSetting(state.projectId, JSON.stringify(projectId))
    },
    project(state, project) {
      state.project = project
      this._vm.setSetting(state.projectId, JSON.stringify(state.project))
    },
    addImageToProject(state, image) {
      if (!state.project.images) {
        state.project.images = []
      }

      state.project.images.push(image)
      this._vm.setSetting(state.projectId, JSON.stringify(state.project))
    },
    removeImageFromProject(state, imageIndex) {
      state.project.images.splice(imageIndex, 1)
      this._vm.setSetting(state.projectId, JSON.stringify(state.project))
    }
  },
  actions: {
    showImagesIOS({ state, commit }) {
      try {
        const project = state.project
        let allLocalIdentifiers = []

        if (project) {
          if (project.images && project.images.length > 0) {
            // Fill allLocalIdentifiers, make sure to handle images without a localIdentifier and duplicates
            for (let i = 0; i < project.images.length; i++) {
              const image = project.images[i]

              if (image.localIdentifier && !allLocalIdentifiers.includes(image.localIdentifier)) {
                allLocalIdentifiers.push(image.localIdentifier)
              } else {
                commit('removeImageFromProject', i--)
              }
            }

            // Get PHAssets from our local identifiers, turn them into UIImages
            const sortImagesPromise = new Promise((resolve, reject) => {
              let phassets = []
              let uiimages = []

              PHPhotoLibrary.requestAuthorization(status => {
                if (status == PHAuthorizationStatus.Authorized) {
                  // Get PHAssets from the local ids. This will return the PHAssets alphabetically sorted by their local id.
                  phassets = getPHAssets(allLocalIdentifiers)

                  // Sort project images alphabetically so that it matches up with the phassets array
                  const projectImagesSortedAlphabetically = sortLocalIDs(project.images)

                  // Get UIImages
                  for (let i = 0; i < phassets.length; i++) {
                    const phasset = phassets[i]

                    let options = new PHImageRequestOptions()

                    options.isNetworkAccessAllowed = true
                    options.isSynchronous = true
                    options.version = PHImageRequestOptionsVersion.PHImageRequestOptionsVersionOriginal
                    options.deliveryMode =
                      PHImageRequestOptionsDeliveryMode.PHImageRequestOptionsDeliveryModeHighQualityFormat
                    options.resizeMode = PHImageRequestOptionsResizeMode.PHImageRequestOptionsResizeModeExact

                    const imageManager = new PHImageManager()
                    let thumbnailSize = new CGSize(400, 400)

                    imageManager.requestImageForAssetTargetSizeContentModeOptionsResultHandler(
                      phasset,
                      thumbnailSize,
                      PHImageContentMode.AspectFit,
                      options,
                      function(result) {
                        if (result) {
                          // Compare phasset and projectImagesSortedAlphabetically[i]. If it not exists, remove image from project
                          if (phasset.localIdentifier != projectImagesSortedAlphabetically[i].localIdentifier) {
                            commit('removeImageFromProject', i--)
                          } else {
                            uiimages.push({
                              localIdentifier: projectImagesSortedAlphabetically[i].localIdentifier,
                              creationDate: new Date(projectImagesSortedAlphabetically[i].creationDate),
                              image: result // uiimage
                            })
                          }
                        } else {
                          console.log('Cannot get image for localid:', phasset.localIdentifier)
                        }
                      }
                    )
                  }
                }
              })

              let timeout
              let interval
              timeout = setTimeout(() => {
                reject('Timeout')
                clearInterval(interval)
              }, 5000)

              interval = setInterval(() => {
                if (uiimages.length == phassets.length) {
                  resolve(uiimages)
                  clearInterval(interval)
                  clearTimeout(timeout)
                } else {
                  console.log('uiimages NOT same length as phassets', uiimages.length, phassets.length)
                }
              }, 50)
            })

            // Get UIImages and sort them by date
            sortImagesPromise
              .then(uiimages => {
                for (let i = 0; i < project.images.length; i++) {
                  const projectImageObject = project.images[i]
                  if (
                    projectImageObject &&
                    projectImageObject.localIdentifier &&
                    uiimages[i] &&
                    uiimages[i].localIdentifier
                  ) {
                    projectImageObject.image = uiimages[i].image
                    projectImageObject.creationDate = uiimages[i].creationDate
                    projectImageObject.localIdentifier = uiimages[i].localIdentifier
                  } else {
                    // Photo is missing, remove it from store
                    commit('removeImageFromProject', i--)
                  }
                }

                project.images.sort((a, b) => {
                  return a.creationDate > b.creationDate
                })

                commit('project', project)
              })
              .catch(error => {
                console.error('sortImagesPromise catch error', error)
              })
          } else {
            console.log('no project images')
          }
        }
      } catch (error) {
        console.log('PROJECT STORE', error)
      }
    }
  }
}

function getPHAssets(allLocalIdentifiers) {
  let fetchResults = new PHFetchResult()
  let fetchOptions = new PHFetchOptions()
  let assets = []
  fetchResults = PHAsset.fetchAssetsWithLocalIdentifiersOptions(allLocalIdentifiers, fetchOptions)

  // Get PHAssets from the local ids. This will return the PHAssets alphabetically sorted by their local id.
  let index = fetchResults.count
  fetchResults.enumerateObjectsUsingBlock(function(fetchResult, index, yes) {
    assets.push(fetchResult)
  })

  return assets
}

function sortLocalIDs(images) {
  const imagesSortedAlphabetically = images.sort((a, b) => {
    return a.localIdentifier > b.localIdentifier
  })
  return imagesSortedAlphabetically
}

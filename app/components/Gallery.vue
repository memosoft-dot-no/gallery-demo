<template>
  <Page>
    <ActionBar title="Gallery"></ActionBar>
    <FlexboxLayout flexDirection="column" @loaded="onLoaded" :class="dialogShown ? 'dialogOpen' : ''">
      <FlexboxLayout flexGrow="1" flexDirection="column" padding="0 16" width="100%">
        <FlexboxLayout v-if="!dialogShown" justifyContent="flex-end" marginBottom="16" flexShrink="0"> </FlexboxLayout>
        <FlexboxLayout flexGrow="1" flexDirection="column" justifyContent="space-between">
          <ScrollView class="content">
            <FlexboxLayout flexWrap="wrap" justifyContent="flex-start">
              <StackLayout v-for="(image, i) in _images" :key="'image-' + i" borderRadius="24" margin="2">
                <AbsoluteLayout>
                  <Image
                    v-if="image.image && image.image.hash"
                    :src="image.image"
                    stretch="aspectFill"
                    height="90"
                    width="31%"
                  ></Image>
                </AbsoluteLayout>
              </StackLayout>
            </FlexboxLayout>
          </ScrollView>
          <FlexboxLayout v-if="!canToggle && !dialogShown" justifyContent="flex-end" marginBottom="24" flexShrink="0">
            <IconWithCircleBackground
              :size="66"
              icon="images"
              iconColor="white"
              backgroundColor="#00997a"
              :onPress="() => openCameraRoll()"
            />
          </FlexboxLayout>
        </FlexboxLayout>
      </FlexboxLayout>
    </FlexboxLayout>
  </Page>
</template>

<script>
import { isIOS } from 'tns-core-modules/platform'
import IconWithCircleBackground from './IconWithCircleBackground'
// import Image from './Image'
import addImagesFromCameraRoll from '../lib/addImagesFromCameraRoll'

export default {
  data() {
    return {
      canToggle: false,
      selectedItems: [],
      dialogShown: false
    }
  },
  components: { IconWithCircleBackground },
  mounted() {
    this.$store.dispatch('project/showImagesIOS')
  },
  computed: {
    _images() {
      if (this.$store.state.project.project && this.$store.state.project.project.images) {
        return this.$store.state.project.project.images
      }
      return []
    }
  },
  methods: {
    getImageIdentifiers() {
      const allLocalIdentifiers = []
      this.$store.state.project.project.images.forEach(image => {
        allLocalIdentifiers.push(image.localIdentifier)
      })
      return allLocalIdentifiers
    },
    openCameraRoll() {
      try {
        addImagesFromCameraRoll()
          .then(imageObjects => {
            imageObjects.forEach(imageObject => {
              this.$store.commit('project/addImageToProject', imageObject)
            })
          })
          .catch(e => {
            console.log('Add images from camera roll error', e)
          })
          .then(() => {
            this.$store.dispatch('project/showImagesIOS')
          })
      } catch (error) {
        console.error('crash', error)
      }
    }
  },
  props: {
    id: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: false
    }
  }
}
</script>

<style scoped lang="scss">
.bottom-menu {
  background-color: var(--light-color-primary);
  padding: 24;
  border-radius: 36 36 0 0;

  > * {
    color: white;
  }
}
.content {
  image,
  label {
    border-radius: 24;
  }
}
.dialog-wrapper {
  z-index: 1;
  height: 40%;
  visibility: collapse;
  opacity: 0;
}
.dialog {
  border-width: 1;
  border-color: #ddd;
  width: 90%;
  border-radius: 8;
}
.dialogOpen .dialog-wrapper {
  visibility: visible;
  animation-name: show;
  animation-duration: 400ms;
  animation-fill-mode: forwards;
}
.dialogOpen .content {
  opacity: 0.2;
}

@keyframes show {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

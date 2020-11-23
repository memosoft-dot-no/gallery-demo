<template>
  <FlexboxLayout
    :backgroundColor="backgroundColor"
    flexShrink="0"
    class="icon"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    :width="size"
    :height="size"
    @tap="() => (onPress ? onPress() : null)"
  >
    <Label :class="animation ? 'far-pro' : 'far-pro'" :text="icon" :color="iconColor" />
  </FlexboxLayout>
</template>

<script>
export default {
  mounted() {},
  computed: {},
  methods: {},
  props: {
    size: {
      type: Number,
      required: false
    },
    icon: {
      type: String,
      required: false
    },
    backgroundColor: {
      type: String,
      required: false
    },
    iconColor: {
      type: String,
      required: false
    },
    onPress: {
      type: Function,
      required: false
    },
    animation: {
      type: Boolean,
      required: false
    }
  }
}
</script>

<style scoped lang="scss">
.icon {
  border-radius: 100;
}
</style>

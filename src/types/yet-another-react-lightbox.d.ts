import { PluginProps } from "yet-another-react-lightbox"

declare function Comments({ augment, contains, addParent }: PluginProps): void

declare module "yet-another-react-lightbox" {
  interface LightboxProps extends LightboxProps {
    /** Comments plugin settings */
    comments?: {
      photosList?: Photo[]
    }
  }
}

export { Comments as default }

import {
  PluginProps,
  addToolbarButton,
  createModule,
  MODULE_CONTROLLER,
  PLUGIN_THUMBNAILS,
} from 'yet-another-react-lightbox'

import CommentsButton from './CommentsButton'
import CommentsContext from './CommentsContext'

export default function Comments({
  augment,
  contains,
  addParent,
}: PluginProps) {
  augment(({ toolbar, ...rest }) => ({
    toolbar: addToolbarButton(toolbar, 'Comments', <CommentsButton />),
    ...rest,
  }))

  addParent(
    contains(PLUGIN_THUMBNAILS) ? PLUGIN_THUMBNAILS : MODULE_CONTROLLER,
    createModule('Comments', CommentsContext),
  )
}

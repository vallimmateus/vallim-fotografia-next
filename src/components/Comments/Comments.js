import {
  addToolbarButton,
  createModule,
  MODULE_CONTROLLER,
  PLUGIN_THUMBNAILS,
} from 'yet-another-react-lightbox'

import CommentsButton from './CommentsButton'
import CommentsContext, { resolveCommentsProps } from './CommentsContext'

export default function Comments({ augment, contains, addParent }) {
  augment(({ toolbar, comments, ...rest }) => ({
    toolbar: addToolbarButton(toolbar, 'Comments', <CommentsButton />),
    comments: resolveCommentsProps(comments),
    ...rest,
  }))

  addParent(
    contains(PLUGIN_THUMBNAILS) ? PLUGIN_THUMBNAILS : MODULE_CONTROLLER,
    createModule('Comments', CommentsContext),
  )
}

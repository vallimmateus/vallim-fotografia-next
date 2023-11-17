import {
  addToolbarButton,
  createModule,
  MODULE_CONTROLLER,
  PLUGIN_THUMBNAILS,
  PluginProps,
} from "yet-another-react-lightbox";

import CommentsButton from "./commentsButton";
import CommentsContext from "./commentsContext";

export default function Comments({
  augment,
  contains,
  addParent,
}: PluginProps) {
  augment(({ toolbar, ...rest }) => ({
    toolbar: addToolbarButton(toolbar, "Comments", <CommentsButton />),
    ...rest,
  }));

  addParent(
    contains(PLUGIN_THUMBNAILS) ? PLUGIN_THUMBNAILS : MODULE_CONTROLLER,
    createModule("Comments", CommentsContext),
  );
}

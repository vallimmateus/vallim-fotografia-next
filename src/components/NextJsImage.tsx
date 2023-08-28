import Image from "next/image";
import type { RenderPhotoProps } from "react-photo-album";

export default function NextJsImage({
    photo,
    imageProps: { alt, title, sizes, className, onClick },
    wrapperStyle,
}: RenderPhotoProps) {
    return (
        <div style={{ ...wrapperStyle, position: "relative" }}>
            <Image
                fill
                src={photo}
                quality={50}
                loading="lazy"
                placeholder={"blurDataURL" in photo ? "blur" : undefined}
                {...{ alt, title, sizes, className, onClick }}
            />
        </div>
    );
}
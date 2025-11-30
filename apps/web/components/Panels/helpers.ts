export function setHeight(ref: React.RefObject<HTMLDivElement | null>, isOpen: boolean) {
    if (!ref.current) return;

    if (isOpen) {
        // Measure the scrollHeight (natural content height)
        const height = ref.current.scrollHeight;
        ref.current.style.minHeight = `${height}px`;
    } else {
        ref.current.style.minHeight = "0px";
    }
}
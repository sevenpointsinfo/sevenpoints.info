Zakho Conference Hall — image filenames the code expects:

hero.webp         - main project card image (Selected Projects grid)
exterior-01.webp  - used in "Perfectly Designed" story section
exterior-02.webp
exterior-03.webp
interior-01.webp  - used in "Smartly Executed" story section
interior-02.webp
interior-03.webp
detail-01.webp

Not every file needs to exist before launch — index.html only
references hero.webp, exterior-01.webp and interior-01.webp directly.
The rest are here so you can extend the project into a full gallery
later without renaming anything.

Each <img> in index.html for this project carries its own
object-position value (see css/style.css, search "zakho") — adjust
those per-image if the automatic crop cuts off something important.

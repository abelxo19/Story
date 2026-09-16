from pathlib import Path

src = Path(
    r"C:\Users\HP\.cursor\projects\c-Users-HP-Story\agent-tools\0862c161-217a-4959-80f0-20d8c4295f73.txt"
)
out_dir = Path(r"c:\Users\HP\Story\backend\stories")
out_dir.mkdir(parents=True, exist_ok=True)
text = src.read_text(encoding="utf-8")


def unwrap(body: str) -> list[str]:
    paras: list[str] = []
    buf: list[str] = []
    for line in body.splitlines():
        if line.strip() == "":
            if buf:
                paras.append(" ".join(buf))
                buf = []
        else:
            buf.append(line.strip())
    if buf:
        paras.append(" ".join(buf))
    return paras


def extract_opening(opening: str, ending: str) -> list[str]:
    i = text.find(opening)
    j = text.find(ending, i)
    return unwrap(text[i:j].strip())


def scene(title: str, image: str, paras: list[str]) -> str:
    return f"## {title}\n\n![]({image})\n\n" + "\n\n".join(paras)


hansel = extract_opening(
    "Once upon a time there dwelt near a large wood",
    "OH, IF I COULD BUT SHIVER!",
)
snow = extract_opening(
    "It was in the middle of winter, when the broad flakes of snow",
    "CATHERINE AND FREDERICK",
)

hansel_md = """---
id: "1"
slug: hansel-and-gretel
title: Hansel and Gretel
description: Two children are left in the forest, follow a trail home, and find a house made of bread and sugar.
source: Project Gutenberg eBook #11027 — Grimm's Fairy Stories (1922), from the Brothers Grimm.
sourceUrl: https://www.gutenberg.org/ebooks/11027
---

""" + "\n\n".join(
    [
        scene(
            "The Dark Woods",
            "/images/stories/hansel-and-gretel/scene-1.svg",
            hansel[0:4],
        ),
        scene(
            "The Pebble Path",
            "/images/stories/hansel-and-gretel/scene-2.svg",
            hansel[4:8],
        ),
        scene(
            "The Breadcrumb Trail",
            "/images/stories/hansel-and-gretel/scene-2.svg",
            hansel[8:15],
        ),
        scene(
            "The House of Bread",
            "/images/stories/hansel-and-gretel/scene-3.svg",
            hansel[15:17],
        ),
        scene(
            "The Witch's Cage",
            "/images/stories/hansel-and-gretel/scene-3.svg",
            hansel[17:19],
        ),
        scene(
            "The Way Home",
            "/images/stories/hansel-and-gretel/scene-4.svg",
            hansel[19:],
        ),
    ]
)

snow_md = """---
id: "2"
slug: snow-white
title: Snow White
description: A princess as white as snow, as red as blood, and as black as ebony is hidden in the forest with seven dwarfs.
source: Project Gutenberg eBook #11027 — Grimm's Fairy Stories (1922), from the Brothers Grimm.
sourceUrl: https://www.gutenberg.org/ebooks/11027
---

""" + "\n\n".join(
    [
        scene(
            "The Ebony Window",
            "/images/stories/snow-white/scene-1.svg",
            snow[0:6],
        ),
        scene(
            "Into the Forest",
            "/images/stories/snow-white/scene-2.svg",
            snow[6:8],
        ),
        scene(
            "The Seven Dwarfs",
            "/images/stories/snow-white/scene-3.svg",
            snow[8:12],
        ),
        scene(
            "The Pedlar's Wares",
            "/images/stories/snow-white/scene-3.svg",
            snow[12:16],
        ),
        scene(
            "The Poisoned Apple",
            "/images/stories/snow-white/scene-4.svg",
            snow[16:18],
        ),
        scene(
            "The Glass Coffin",
            "/images/stories/snow-white/scene-4.svg",
            snow[18:],
        ),
    ]
)

(out_dir / "hansel-and-gretel.md").write_text(hansel_md, encoding="utf-8")
(out_dir / "snow-white.md").write_text(snow_md, encoding="utf-8")
print("wrote", out_dir)
print("hansel scenes ok", len(hansel), "snow scenes ok", len(snow))

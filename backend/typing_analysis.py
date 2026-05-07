from collections import Counter
from itertools import zip_longest
from typing import Dict, List


FINGER_MAP = {
    "left-pinky": list("qaz"),
    "left-ring": list("wsx"),
    "left-middle": list("edc"),
    "left-index": list("rfvtgb"),
    "thumb": list(" "),
    "right-index": list("yhnujm"),
    "right-middle": list("ik,"),
    "right-ring": list("ol."),
    "right-pinky": list("p;/"),
}


def build_wrong_char_map(practice_text: str, user_text: str) -> Dict[str, int]:
    wrong_char_map: Counter[str] = Counter()

    for practice_char, user_char in zip_longest(practice_text, user_text, fillvalue=""):
        if not practice_char:
            continue

        if practice_char != user_char:
            wrong_char_map[practice_char.lower()] += 1

    return dict(wrong_char_map)


def build_wrong_char_array(wrong_char_map: Dict[str, int]) -> List[Dict[str, int]]:
    return [{char: freq} for char, freq in wrong_char_map.items()]


def merge_sort_wrong_chars(wrong_char_array: List[Dict[str, int]]) -> List[Dict[str, int]]:
    if len(wrong_char_array) <= 1:
        return wrong_char_array

    mid = len(wrong_char_array) // 2
    left = merge_sort_wrong_chars(wrong_char_array[:mid])
    right = merge_sort_wrong_chars(wrong_char_array[mid:])

    output: List[Dict[str, int]] = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if list(left[i].values())[0] > list(right[j].values())[0]:
            output.append(left[i])
            i += 1
        else:
            output.append(right[j])
            j += 1

    while i < len(left):
        output.append(left[i])
        i += 1

    while j < len(right):
        output.append(right[j])
        j += 1

    return output


def top_wrong_chars(wrong_char_map: Dict[str, int], top_k: int = 5) -> List[str]:
    wrong_char_array = build_wrong_char_array(wrong_char_map)
    sorted_wrong_char_array = merge_sort_wrong_chars(wrong_char_array)
    top_wrong_char_array = sorted_wrong_char_array[:top_k]

    top_chars: List[str] = []
    for item in top_wrong_char_array:
        for char in item:
            top_chars.append(char)

    return top_chars


def expand_chars_by_finger(top_chars: List[str]) -> List[str]:
    complete_chars: List[str] = []
    seen = set()

    for char in top_chars:
        found = False
        for char_list in FINGER_MAP.values():
            if char in char_list:
                found = True
                for group_char in char_list:
                    if group_char not in seen:
                        seen.add(group_char)
                        complete_chars.append(group_char)
                break
        if not found:
            if char not in seen:
                seen.add(char)
                complete_chars.append(char)

    return complete_chars


def analyze_typing_session(practice_text: str, user_text: str, top_k: int = 5) -> dict:
    wrong_char_map = build_wrong_char_map(practice_text, user_text)
    top_chars = top_wrong_chars(wrong_char_map, top_k=top_k)
    focus_chars = expand_chars_by_finger(top_chars)

    return {
        "wrong_char_map": wrong_char_map,
        "top_chars": top_chars,
        "focus_chars": focus_chars,
    }
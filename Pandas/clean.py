import os
import pandas as pd


def clean_csv_dir(input_dir):
    output_dir = input_dir + "_Cleaned"
    os.makedirs(output_dir, exist_ok=True)
    for filename in os.listdir(input_dir):
        if filename.endswith(".csv"):
            print(f"Processing: {filename}")
            filepath = os.path.join(input_dir, filename)
            try:
                df = pd.read_csv(
                    filepath, dtype=str, encoding="utf-16", on_bad_lines="skip"
                )
            except UnicodeDecodeError:
                try:
                    df = pd.read_csv(
                        filepath, dtype=str, encoding="utf-8-sig", on_bad_lines="skip"
                    )
                except UnicodeDecodeError:
                    try:
                        df = pd.read_csv(
                            filepath, dtype=str, encoding="utf-8", on_bad_lines="skip"
                        )
                    except UnicodeDecodeError:
                        try:
                            df = pd.read_csv(
                                filepath,
                                dtype=str,
                                encoding="latin-1",
                                on_bad_lines="skip",
                            )
                        except UnicodeDecodeError:
                            print(
                                f"Failed to read {filename} with all encoding attempts."
                            )
                            continue
            df.columns = df.columns.str.strip()
            df = df.fillna("")

            # Check Genus
            if "Genus" not in df.columns:
                df["Genus"] = None
            # Check SpecificEpithet
            if "SpecificEpithet" not in df.columns:
                df["SpecificEpithet"] = None

            df["ScientificName"] = (
                df["Genus"].str.strip().fillna("")
                + " "
                + df["SpecificEpithet"].str.strip().fillna("")
            )

            island_cols = [
                "Darwin",
                "Española",
                "Fernandina",
                "Floreana",
                "Genovesa",
                "Isabela",
                "Marchena",
                "Pinta",
                "Pinzón",
                "San Cristóbal",
                "Santa Cruz",
                "Santa Fé",
                "Santiago",
                "Unknown_Island",
                "Wolf",
            ]
            bioregion_cols = [
                "Elizabeth Bay/Bahía Elizabeth",
                "Far-northern/Lejano Norte",
                "Northern/Norte",
                "South-eastern/Centro Sur",
                "Western/Oeste",
                "Unknown_Bioregion",
            ]

            # Check Islands
            for col in island_cols:
                if col not in df.columns:
                    df[col] = ""

            # Check Bioregions
            for col in bioregion_cols:
                if col not in df.columns:
                    df[col] = ""

            df["Islands"] = df[island_cols].apply(
                lambda row: ", ".join(
                    [
                        col
                        for col in island_cols
                        if str(row[col]).strip() and str(row[col]).strip() != "0"
                    ]
                ),
                axis=1,
            )
            df["Bioregions"] = df[bioregion_cols].apply(
                lambda row: ", ".join(
                    [
                        col
                        for col in bioregion_cols
                        if str(row[col]).strip() and str(row[col]).strip() != "0"
                    ]
                ),
                axis=1,
            )

            # Check CommonNameEnglish
            if "CommonNameEnglish" not in df.columns:
                df["CommonNameEnglish"] = None

            cleaned = df[
                ["ScientificName", "CommonNameEnglish", "Islands", "Bioregions"]
            ]
            cleaned.to_csv(os.path.join(output_dir, filename), index=False)
            print(f"Cleaned: {filename}")


def filter_specific_animals(input_dir):
    # List of scientific names to filter
    scientific_names = [
        "Geospiza fortis",
        "Phoebastria irrorata",
        "Sula nebouxii",
        "Falco femoralis binotatus",
        "Spheniscus mendiculus",
        "Chelonoidis nigra",
        "Amblyrhynchus cristatus",
        "Conolophus subcristatus",
        "Zalophus wollebaeki",
        "Grapsus grapsus",
    ]
    output_dir = os.path.join("filtered")
    os.makedirs(output_dir, exist_ok=True)
    filtered_rows = []

    for filename in os.listdir(input_dir):
        if filename.endswith(".csv"):
            filepath = os.path.join(input_dir, filename)
            # Try reading with multiple encodings
            for encoding in ["utf-16", "utf-8-sig", "utf-8", "latin-1"]:
                try:
                    df = pd.read_csv(
                        filepath, dtype=str, encoding=encoding, on_bad_lines="skip"
                    )
                    break
                except UnicodeDecodeError:
                    continue
            else:
                print(f"Failed to read {filename} with all encoding attempts.")
                continue

            # Clean up columns
            df.columns = df.columns.str.strip()
            if "ScientificName" not in df.columns:
                # Try to reconstruct if possible
                genus = (
                    df["Genus"].str.strip().fillna("") if "Genus" in df.columns else ""
                )
                species = (
                    df["SpecificEpithet"].str.strip().fillna("")
                    if "SpecificEpithet" in df.columns
                    else ""
                )
                df["ScientificName"] = genus + " " + species

            # Filter rows
            filtered = df[df["ScientificName"].isin(scientific_names)]
            if not filtered.empty:
                filtered_rows.append(filtered)

    if filtered_rows:
        result = pd.concat(filtered_rows, ignore_index=True)
        result.to_csv(os.path.join(output_dir, "filtered.csv"), index=False)
        print(f"Filtered animals saved to {os.path.join(output_dir, 'filtered.csv')}")
    else:
        print("No matching animals found.")

import os
import pandas as pd
import psycopg2

CSV_PATH = "Jacobs Courses and Electives - Program & Concentration Courses.csv"
DATABASE_URL = os.environ["DATABASE_URL"]

def infer_department(full_code):
    if pd.isna(full_code):
        return None
    return full_code.split()[0].strip().lower()

def upsert_category(cur, name, slug):
    cur.execute(
        "INSERT INTO course_categories (name, slug) VALUES (%s, %s) ON CONFLICT (slug) DO NOTHING RETURNING id",
        (name.upper(), slug)
    )
    result = cur.fetchone()
    if result:
        return result[0]
    cur.execute("SELECT id FROM course_categories WHERE slug = %s", (slug,))
    return cur.fetchone()[0]

def parse_credits(credit_str):
    try:
        if pd.isna(credit_str):
            return None
        # If it's a range or 'or', take the first valid number
        if isinstance(credit_str, str):
            for part in credit_str.replace('/', ' ').replace('or', ' ').split():
                try:
                    return float(part)
                except ValueError:
                    continue
            return None
        return float(credit_str)
    except Exception:
        return None

def upsert_course(cur, row):
    credits = parse_credits(row['Credit Hours'])
    if credits is None:
        raise ValueError(f"Invalid or missing credits: {row['Credit Hours']}")
    cur.execute(
        """
        INSERT INTO courses (code, full_code, name, description, credits, department, concentration_core, concentration_elective, semester, year)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (code, semester, year) DO UPDATE SET
            name=EXCLUDED.name,
            description=EXCLUDED.description,
            credits=EXCLUDED.credits,
            department=EXCLUDED.department,
            concentration_core=EXCLUDED.concentration_core,
            concentration_elective=EXCLUDED.concentration_elective
        RETURNING id
        """,
        (
            row['Course Code'].replace(" ", ""),
            row['Course Code'],
            row['Course Description'],
            row['Course Description'],
            credits,
            infer_department(row['Course Code']),
            row.get('Concentration Core'),
            row.get('Concentration Elective'),
            'Fall',
            2024
        )
    )
    return cur.fetchone()[0]

def main():
    # Skip the first row (note) and read the CSV
    df = pd.read_csv(CSV_PATH, skiprows=1)
    df = df[df['Course Code'].notnull()]  # skip empty rows

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    for _, row in df.iterrows():
        try:
            credits = parse_credits(row['Credit Hours'])
            if credits is None:
                print(f"Skipping {row['Course Code']}: invalid or missing credits '{row['Credit Hours']}'")
                continue
            course_id = upsert_course(cur, row)
            department = infer_department(row['Course Code'])
            if department:
                cat_id = upsert_category(cur, department, department)
                cur.execute(
                    "INSERT INTO course_category_junction (course_id, category_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (course_id, cat_id)
                )
            conn.commit()
        except ValueError as ve:
            print(f"Skipping {row['Course Code']}: {ve}")
            conn.rollback()
        except Exception as e:
            print(f"Error processing {row['Course Code']}: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print("Done!")

if __name__ == "__main__":
    main()

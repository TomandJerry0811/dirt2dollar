from src.core.settings import settings


if __name__ == "__main__":

    print("\n========== APPLICATION ==========")

    print("App Name       :", settings.app_name)
    print("App Version    :", settings.app_version)

    print("\n========== SUPABASE ==========")

    print("Supabase URL   :", settings.supabase_url)
    print("Supabase Key   :", settings.supabase_key[:10] + "...")

    print("\n========== GROQ ==========")

    print("Groq Model     :", settings.groq_model)
    print("Groq API Key   :", settings.groq_api_key[:10] + "...")

    print("\n========== HUGGINGFACE ==========")

    print("Embedding Model:", settings.embedding_model)
    print("HF API Key     :", settings.huggingface_api_key[:10] + "...")

    print("\n========== GOOGLE SHEETS ==========")

    print("Sheet ID       :", settings.google_sheet_id)
    print("Sheet Name     :", settings.google_sheet_name)
    print("Credentials    :", settings.google_credentials_file)

    print("\n========== SETTINGS LOADED SUCCESSFULLY ==========")
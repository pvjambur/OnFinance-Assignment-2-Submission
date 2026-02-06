from setuptools import setup, find_packages

setup(
    name="oracle-monitor",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "click",
        "supabase",
        "deepdiff",
        "python-dotenv",
        "rich"
    ],
    entry_points={
        "console_scripts": [
            "oracle-monitor=oracle_monitor.cli:main",
        ],
    },
)

import sys
import os

# add project root so pytest can find `app` or your modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import os
import re

def fix_imports_in_file(filepath):
    """Fix 'from backend.' imports to relative imports"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace 'from backend.' with 'from '
        content = re.sub(r'from backend\.', 'from ', content)
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}")
        return False

def main():
    backend_dir = r"d:\Bsc.CT\Smart Queue\backend"
    fixed_count = 0
    
    # Walk through all Python files in backend directory
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                if fix_imports_in_file(filepath):
                    fixed_count += 1
    
    print(f"\n{'='*50}")
    print(f"Total files fixed: {fixed_count}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()

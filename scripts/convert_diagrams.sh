#!/bin/bash

# Base directories
SRC_DIR="diagrams"
DEST_DIR="converted_diagrams"

# Find all .mmd files
find "$SRC_DIR" -name "*.mmd" | while read file; do
    # Construct output path
    # Remove 'diagrams/' from start of path
    rel_path="${file#$SRC_DIR/}"
    # Replace extension with .png
    out_path="$DEST_DIR/${rel_path%.mmd}.png"
    # Get directory of output file
    out_dir=$(dirname "$out_path")
    
    # Create directory if it doesn't exist
    mkdir -p "$out_dir"
    
    echo "Converting $file to $out_path..."
    
    # Run mmdc with local installation
    ./node_modules/.bin/mmdc -i "$file" -o "$out_path" -w 2000 -b transparent
done

echo "Conversion complete."

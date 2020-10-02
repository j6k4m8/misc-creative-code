for file in ./images-extra/*.jpg; do
  convert "$file" -flip "${file%.jpg}"_flip.jpg
done

for file in ./images-extra/*.jpg; do
  convert "$file" -flop "${file%.jpg}"_flop.jpg
done

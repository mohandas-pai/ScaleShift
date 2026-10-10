# ScaleShift ratio correction report

All stored `ratio` values were recalculated as `aValue / bValue`, rounded to four decimal places.
This corrects arithmetic consistency only; it does **not** independently verify the real-world measurements or units.

- Rounds with a changed stored ratio: 211
- Rounds where `aValue / bValue` is below 1: 5

## Important: measurement/data issues still need review

The following rounds have A smaller than B based on the supplied numeric values. Their ratios now correctly reflect A/B, but the game question wording and slider are designed for ratios greater than 1. Some of these values also look implausible for the named object and dimension. They should be corrected or the object order/wording should be changed before deployment.

| Day | Round | A | B | A value | B value | A/B | Dimension | Unit |
|---:|---:|---|---|---:|---:|---:|---|---|
| 16 | 1 | F-16 fighter jet | Ambulance | 15 | 3500 | 0.0043 | length | m |
| 22 | 1 | Sunflower | Domestic cat | 3.5 | 4 | 0.875 | height | m |
| 55 | 2 | Nile crocodile | Dog | 0.5 | 0.6 | 0.8333 | height | m |
| 71 | 1 | Boeing 777 | Fire truck | 74 | 15000 | 0.0049 | length | m |
| 93 | 2 | Saturn V rocket | Fire truck | 111 | 15000 | 0.0074 | length | m |

## Changed ratio values

| Day | Round | Comparison | Old ratio | Corrected A/B |
|---:|---:|---|---:|---:|
| 1 | 2 | Bamboo vs. Sunflower | 5.71 | 5.7143 |
| 1 | 3 | Sea lion vs. Bag of cement | 12 | 10 |
| 1 | 4 | Airbus A320 vs. Golden eagle | 16.27 | 15.5652 |
| 3 | 3 | Leaning Tower of Pisa vs. Kangaroo | 31.67 | 31.6722 |
| 3 | 4 | Hang glider vs. Flying fox | 6.67 | 6.6706 |
| 4 | 2 | Bat vs. Hummingbird | 4.17 | 4.2 |
| 4 | 4 | Whale shark vs. Crocodile | 38 | 37.5 |
| 5 | 1 | Golden eagle vs. Heron | 1.22 | 1.2222 |
| 5 | 2 | Leaning Tower of Pisa vs. African elephant | 17.27 | 17.2687 |
| 5 | 3 | Boeing 747 vs. Limousine | 11.83 | 11.7833 |
| 6 | 1 | Boeing 747 vs. Volkswagen Golf | 16.51 | 16.4419 |
| 6 | 2 | Christ the Redeemer vs. Giant panda | 31.67 | 31.6667 |
| 6 | 4 | Boeing 747 vs. Golden eagle | 29.27 | 29.7391 |
| 6 | 5 | Blue whale vs. Komodo dragon | 8.33 | 8.6667 |
| 7 | 4 | Golden eagle vs. Great horned owl | 1.57 | 1.5714 |
| 8 | 1 | Tesla Model 3 vs. Giraffe | 1.8 | 2 |
| 8 | 2 | Sperm whale vs. African elephant | 2.77 | 3 |
| 9 | 2 | Concorde vs. Glider | 1.71 | 1.4222 |
| 9 | 3 | Moose vs. Llama | 1.17 | 1.1667 |
| 9 | 5 | Boeing 747 vs. Tesla Model 3 | 15.11 | 15.0426 |
| 10 | 1 | Airbus A380 vs. B-52 bomber | 1.41 | 1.4149 |
| 10 | 2 | Coconut palm vs. Kangaroo | 13.89 | 13.8889 |
| 10 | 4 | Whale shark vs. African elephant | 3.45 | 2.5 |
| 11 | 2 | Christ the Redeemer vs. Llama | 21.11 | 21.1083 |
| 11 | 4 | Boeing 777 vs. Cessna 172 | 5.89 | 5.8909 |
| 11 | 5 | Starship vs. Airbus A320 | 3.22 | 3.2199 |
| 12 | 1 | Sunflower vs. Emperor penguin | 2.92 | 2.9167 |
| 12 | 4 | Pelican vs. Dragonfly | 24.17 | 24.1667 |
| 13 | 3 | Sunflower vs. Llama | 1.94 | 2.9167 |
| 13 | 5 | Great white shark vs. Sheep | 14.67 | 14.6667 |
| 14 | 4 | Crocodile vs. Giant squid | 1.82 | 1.3333 |
| 15 | 1 | Boeing 747 vs. B-2 Spirit | 1.23 | 1.3053 |
| 15 | 2 | African elephant vs. Adult human | 1.89 | 1.8882 |
| 15 | 5 | Airbus A380 vs. Boeing 747 | 1.24 | 1.1667 |
| 16 | 1 | F-16 fighter jet vs. Ambulance | 2.31 | 0.0043 |
| 16 | 4 | Cessna 172 vs. Great horned owl | 7.86 | 7.8571 |
| 17 | 1 | Christ the Redeemer vs. Adult human | 21.71 | 21.7118 |
| 17 | 4 | Bald eagle vs. Heron | 1.28 | 1.2778 |
| 17 | 5 | Adult human vs. Emperor penguin | 1.46 | 1.4167 |
| 18 | 1 | Walrus vs. Grizzly bear | 2.78 | 3.3333 |
| 18 | 4 | B-2 Spirit vs. Albatross | 14.97 | 14.9714 |
| 19 | 1 | Football field vs. Giant panda | 60.94 | 60.9389 |
| 19 | 3 | Leaning Tower of Pisa vs. Horse | 35.62 | 35.6187 |
| 19 | 5 | Millennium Bridge vs. Pickup truck | 59.09 | 59.0909 |
| 20 | 1 | Glider vs. Golden eagle | 6.82 | 6.8217 |
| 20 | 2 | Statue of Liberty vs. Giraffe | 16.91 | 16.9091 |
| 21 | 4 | Boeing 747 vs. Crow | 64.4 | 68.4 |
| 21 | 5 | Limousine vs. Tesla Model 3 | 1.28 | 1.2809 |
| 22 | 1 | Sunflower vs. Domestic cat | 14 | 0.875 |
| 22 | 3 | Blue whale vs. Polar bear | 10 | 10.4 |
| 22 | 4 | California condor vs. Heron | 1.67 | 1.6722 |
| 22 | 5 | Statue of Liberty vs. Moose | 44.29 | 44.2905 |
| 23 | 2 | Millennium Bridge vs. Airbus A320 | 8.64 | 8.6399 |
| 23 | 3 | Gateway Arch vs. Camel | 91.43 | 91.4286 |
| 23 | 5 | Sea lion vs. Orangutan | 3.75 | 3.125 |
| 24 | 1 | Giant squid vs. Emperor penguin | 10.83 | 10.9091 |
| 24 | 3 | Christ the Redeemer vs. Ostrich | 14.07 | 14.068 |
| 25 | 5 | Boeing 747 vs. F-22 Raptor | 4.74 | 5.0294 |
| 26 | 1 | Space Shuttle orbiter vs. Cheetah | 24.67 | 24.6733 |
| 26 | 3 | Tesla Model 3 vs. Baboon | 60 | 72 |
| 26 | 4 | Concorde vs. Mute swan | 10.67 | 10.6667 |
| 27 | 1 | Christ the Redeemer vs. Red kangaroo | 21.11 | 21.1125 |
| 27 | 4 | B-2 Spirit vs. Mute swan | 21.83 | 21.8292 |
| 27 | 5 | Eucalyptus tree vs. Emperor penguin | 83.33 | 83.3333 |
| 28 | 2 | African elephant vs. Ostrich | 2.41 | 2.4095 |
| 28 | 3 | Sunflower vs. Ostrich | 1.3 | 1.4 |
| 28 | 4 | F-22 Raptor vs. Albatross | 3.89 | 3.8914 |
| 29 | 5 | Concorde vs. Volkswagen Golf | 14.42 | 14.4186 |
| 30 | 2 | Adult human vs. Giant panda | 1.46 | 1.4167 |
| 30 | 5 | Boeing 747 vs. Wandering albatross | 17.41 | 19.5429 |
| 31 | 1 | Boeing 777 vs. Giant panda | 41.11 | 41.1111 |
| 31 | 2 | Giant sequoia vs. Adult human | 48.57 | 48.5706 |
| 31 | 3 | Sperm whale vs. Fire truck | 3.33 | 3.3333 |
| 31 | 5 | Starship vs. Tennis court | 5.08 | 5.0798 |
| 32 | 1 | Giraffe vs. Dog | 9.17 | 9.1667 |
| 33 | 1 | City bus vs. Blue whale heart | 66.67 | 66.6667 |
| 33 | 2 | Football field vs. Airbus A320 | 2.92 | 2.9199 |
| 33 | 4 | Boeing 777 vs. Stork | 29.45 | 32.4 |
| 35 | 1 | Great horned owl vs. Hummingbird | 11.67 | 11.7 |
| 35 | 3 | Airbus A320 vs. Pickup truck | 6.84 | 6.8364 |
| 36 | 1 | Double-decker bus vs. Emperor penguin | 9.17 | 10 |
| 36 | 4 | Barn owl vs. Butterfly | 3.67 | 3.6667 |
| 37 | 1 | Oak tree vs. Kangaroo | 11.11 | 11.1111 |
| 37 | 3 | Nile crocodile vs. Kangaroo | 1.79 | 1.7857 |
| 37 | 4 | B-2 Spirit vs. Airbus A320 | 1.46 | 1.4601 |
| 39 | 2 | Boeing 737 vs. Swan | 14.92 | 14.9208 |
| 39 | 5 | Seine vs. Airbus A380 | 10.64 | 10.64 |
| 41 | 4 | Boeing 777 vs. F-22 Raptor | 4.76 | 4.7647 |
| 43 | 4 | F-16 fighter jet vs. Mute swan | 4.15 | 4.1667 |
| 43 | 5 | Great white shark vs. Baboon | 36.67 | 44 |
| 44 | 1 | Boeing 747 vs. Airbus A320 | 1.89 | 1.8803 |
| 45 | 1 | Airbus A380 vs. Flying fox | 53.2 | 46.9412 |
| 45 | 2 | Space Needle vs. African elephant | 55.76 | 55.7594 |
| 45 | 5 | Barn owl vs. Hummingbird | 9.17 | 9.2 |
| 46 | 1 | Orca vs. Emperor penguin | 6.67 | 6.6727 |
| 46 | 4 | Golden eagle vs. Dragonfly | 18.33 | 18.3333 |
| 46 | 5 | Olympic swimming pool vs. Giant panda | 27.78 | 27.7778 |
| 47 | 1 | Baobab tree vs. Kangaroo | 8.33 | 8.3278 |
| 47 | 3 | Blue whale vs. Double-decker bus | 2.27 | 2.3636 |
| 47 | 5 | Baobab tree vs. Giraffe | 2.73 | 2.7309 |
| 48 | 2 | Blue whale vs. F-16 fighter jet | 1.67 | 1.7333 |
| 48 | 3 | London Eye vs. Camel | 64.29 | 64.2905 |
| 48 | 4 | Great horned owl vs. Dragonfly | 11.67 | 11.6667 |
| 49 | 1 | Concorde vs. Great white shark | 10.33 | 10.3333 |
| 49 | 3 | Baobab tree vs. Llama | 8.33 | 8.3333 |
| 49 | 5 | Boeing 747 vs. Polar bear | 28.4 | 28.28 |
| 50 | 4 | Airbus A380 vs. School bus | 52.27 | 27.7 |
| 51 | 4 | Boeing 747 vs. Snowy owl | 40.25 | 42.75 |
| 52 | 2 | Walrus vs. Crocodile | 2 | 2.5 |
| 52 | 3 | Thames vs. Pickup truck | 62.91 | 62.9091 |
| 53 | 2 | Blue whale vs. London black cab | 5.43 | 5.6522 |
| 54 | 2 | Pigeon vs. Hummingbird | 5.83 | 5.8 |
| 54 | 4 | Sea lion vs. Medium dog | 15 | 12.5 |
| 55 | 1 | Wandering albatross vs. Andean condor | 1.16 | 1.1594 |
| 55 | 2 | Nile crocodile vs. Dog | 1.67 | 0.8333 |
| 55 | 5 | Wandering albatross vs. Flying fox | 2.47 | 2.4706 |
| 56 | 1 | Airbus A320 vs. City bus | 3.13 | 3.1333 |
| 56 | 2 | Moose vs. Horse | 1.31 | 1.3125 |
| 56 | 4 | Bald eagle vs. Pigeon | 3.29 | 3.2857 |
| 57 | 4 | Albatross vs. Butterfly | 11.67 | 11.6667 |
| 58 | 1 | Walrus vs. Giant squid | 3.64 | 3.3333 |
| 59 | 2 | Boeing 747 vs. Andean condor | 20.12 | 21.375 |
| 59 | 3 | Bamboo vs. Dromedary | 9.52 | 9.5238 |
| 60 | 1 | Wandering albatross vs. Dragonfly | 30.83 | 30.8333 |
| 60 | 4 | Airbus A320 vs. Great white shark | 70.91 | 38.1818 |
| 60 | 5 | Boeing 777 vs. Pelican | 22.34 | 23.1429 |
| 61 | 5 | Concorde vs. Airbus A320 | 1.65 | 1.6489 |
| 62 | 1 | Camel vs. Red kangaroo | 1.17 | 1.1687 |
| 62 | 3 | Empire State Building vs. Pickup truck | 80.55 | 80.5491 |
| 63 | 1 | Volkswagen Golf vs. Giraffe | 1.4 | 1.5556 |
| 63 | 2 | Olympic swimming pool vs. Grizzly bear | 20.83 | 20.8292 |
| 64 | 5 | Airbus A380 vs. Tesla Model 3 | 15.53 | 15.4681 |
| 65 | 1 | Great horned owl vs. Fruit bat | 1.17 | 1.1667 |
| 65 | 2 | Coconut palm vs. Emperor penguin | 20.83 | 20.8333 |
| 65 | 3 | Yangtze River vs. Boeing 747 | 88.73 | 88.73 |
| 65 | 5 | Airbus A320 vs. Cessna 172 | 3.25 | 3.2545 |
| 66 | 1 | Giant squid vs. Double-decker bus | 1.18 | 1.0909 |
| 66 | 5 | Nile crocodile vs. Grizzly bear | 2.08 | 2.0833 |
| 67 | 1 | Big Ben vs. Giraffe | 17.45 | 17.4491 |
| 67 | 2 | Adult human vs. Domestic cat | 16.67 | 20 |
| 67 | 3 | Starship vs. Giant panda | 67.22 | 67.2222 |
| 68 | 1 | Sea lion vs. Sheep | 4 | 3.3333 |
| 68 | 2 | Airbus A380 vs. Limousine | 12.17 | 12.1167 |
| 69 | 1 | City bus vs. Pickup truck | 2.18 | 2.1818 |
| 69 | 3 | Sagrada Familia vs. Llama | 95.56 | 95.5583 |
| 69 | 4 | Great white shark vs. Cow | 1.69 | 1.8333 |
| 70 | 1 | Concorde vs. Barn owl | 23.27 | 25.6 |
| 70 | 2 | Great Pyramid of Giza vs. Kangaroo | 77.22 | 77.2222 |
| 70 | 4 | Airbus A320 vs. African elephant | 14.18 | 7 |
| 70 | 5 | F-16 fighter jet vs. California condor | 3.32 | 3.3333 |
| 71 | 1 | Boeing 777 vs. Fire truck | 8.22 | 0.0049 |
| 71 | 2 | Ostrich vs. Adult human | 1.54 | 1.5412 |
| 71 | 4 | Boeing 777 vs. Bald eagle | 28.17 | 28.1739 |
| 72 | 2 | Blue whale vs. Airbus A320 | 1.54 | 2.8571 |
| 72 | 4 | Pelican vs. Mute swan | 1.21 | 1.2083 |
| 73 | 3 | Giant sequoia vs. Horse | 53.12 | 53.1187 |
| 73 | 5 | Whale shark vs. Cow | 29.23 | 25 |
| 75 | 3 | Space Shuttle orbiter vs. London black cab | 8.04 | 8.0391 |
| 75 | 4 | Sperm whale vs. School bus | 4.55 | 5 |
| 76 | 2 | Sagrada Familia vs. Adult human | 98.29 | 98.2882 |
| 76 | 3 | Volkswagen Golf vs. Small car engine | 9.33 | 9.3333 |
| 76 | 4 | F-22 Raptor vs. Swan | 5.67 | 5.6708 |
| 77 | 1 | Statue of Liberty vs. Sunflower | 26.57 | 26.5714 |
| 77 | 2 | Airbus A320 vs. Rhino | 33.91 | 18.2609 |
| 79 | 4 | Tesla Model 3 vs. Pig | 15 | 18 |
| 80 | 1 | Airbus A320 vs. Swan | 14.92 | 14.9167 |
| 80 | 2 | Douglas fir vs. Emperor penguin | 64.17 | 64.1667 |
| 80 | 3 | Volkswagen Golf vs. Cheetah | 2.87 | 2.8667 |
| 81 | 1 | Saturn V rocket vs. Basketball court | 3.85 | 3.9643 |
| 81 | 2 | Horse vs. Emperor penguin | 1.33 | 1.3333 |
| 81 | 4 | Airbus A380 vs. Boeing 777 | 1.23 | 1.2315 |
| 82 | 2 | Sea lion vs. Domestic cat | 66.67 | 62.5 |
| 83 | 4 | Wandering albatross vs. Snowy owl | 2.31 | 2.3125 |
| 84 | 2 | Bald eagle vs. Hummingbird | 19.17 | 19.2 |
| 84 | 5 | Starship vs. Grizzly bear | 50.42 | 50.4208 |
| 85 | 1 | Pelican vs. Snowy owl | 1.81 | 1.8125 |
| 85 | 3 | Football field vs. Grizzly bear | 45.71 | 45.7083 |
| 85 | 4 | Whale shark vs. Polar bear | 42.22 | 30 |
| 85 | 5 | Bald eagle vs. Snowy owl | 1.44 | 1.4375 |
| 86 | 1 | Saturn V rocket vs. Volkswagen Golf | 25.72 | 25.814 |
| 86 | 5 | Concorde vs. African elephant | 9.54 | 10.3333 |
| 87 | 1 | Sunflower vs. Nile crocodile | 3.5 | 7 |
| 87 | 4 | Airbus A320 vs. Pigeon | 51.14 | 51.1429 |
| 87 | 5 | Giant sequoia vs. Camel | 40.48 | 40.481 |
| 88 | 4 | Andean condor vs. Hummingbird | 26.67 | 26.7 |
| 89 | 1 | Boeing 777 vs. Sperm whale | 4.11 | 4.1111 |
| 89 | 2 | B-2 Spirit vs. Swan | 21.83 | 21.8292 |
| 89 | 3 | Bamboo vs. African elephant | 6.06 | 6.25 |
| 90 | 5 | Bat vs. Butterfly | 1.67 | 1.6667 |
| 91 | 1 | Rhine vs. Airbus A380 | 16.85 | 16.8501 |
| 91 | 2 | Oak tree vs. Grizzly bear | 13.33 | 13.3333 |
| 91 | 4 | Boeing 737 vs. Albatross | 10.23 | 10.2286 |
| 91 | 5 | Boeing 777 vs. Horse | 30.83 | 30.8333 |
| 92 | 3 | Boeing 777 vs. Anaconda | 12.33 | 12.3333 |
| 92 | 4 | Swan vs. Heron | 1.33 | 1.3278 |
| 93 | 2 | Saturn V rocket vs. Fire truck | 12.29 | 0.0074 |
| 93 | 4 | Boeing 747 vs. Albatross | 18.4 | 19.5429 |
| 93 | 5 | Crocodile vs. Small car engine | 3.33 | 2.6667 |
| 95 | 3 | Pickup truck vs. Ostrich | 2.04 | 2.0381 |
| 95 | 5 | Cessna 172 vs. Swan | 4.58 | 4.5792 |
| 96 | 2 | Douglas fir vs. Giant panda | 64.17 | 64.1667 |
| 96 | 4 | Concorde vs. Heron | 14.22 | 14.2222 |
| 96 | 5 | Tesla Model 3 vs. Emperor penguin | 3.92 | 4.2727 |
| 97 | 3 | Double-decker bus vs. Anaconda | 1.83 | 1.8333 |
| 97 | 5 | Big Ben vs. Llama | 53.33 | 53.3333 |
| 98 | 4 | Golden eagle vs. Pigeon | 3.14 | 3.1429 |
| 99 | 1 | Eiffel Tower vs. Boeing 747 | 4.65 | 4.6501 |
| 99 | 4 | Airbus A320 vs. Tesla Model 3 | 43.33 | 23.3333 |
| 100 | 1 | Boeing 747 vs. Bald eagle | 28 | 29.7391 |
| 100 | 3 | Rhine vs. Airbus A320 | 32.71 | 32.7101 |
| 100 | 5 | F-22 Raptor vs. Great horned owl | 9.71 | 9.7071 |

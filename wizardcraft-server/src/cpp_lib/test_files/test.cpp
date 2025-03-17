#include <iostream>


int main() {
  std::cout << "C++ program started, waiting for input..." << std::endl;

    std::string input;
    while (std::getline(std::cin, input)) {  
        std::cout << "Received: " << input << std::endl;
    }

    std::cout << "C++ program exiting." << std::endl;
    return 0;
}
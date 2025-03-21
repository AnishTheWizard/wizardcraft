#include <iostream>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <fcntl.h>

int in_pipe[2]; // Child to Parent
int out_pipe[2]; // Parent to Child

int main(int argc, char* argv[]) {

    std::cout << "Creating C++ Proxy\n";

    if(pipe(in_pipe) == -1 || pipe(out_pipe) == -1) {
        perror("pipe");
        exit(1);
        // error
    }

    pid_t pid = fork();

    if(pid == -1) {
        // error
        perror("fork");
        exit(1);
    }
    else if(pid == 0) {
        // Child Process
        // In perspective of the server

        dup2(out_pipe[0], STDIN_FILENO);
        dup2(in_pipe[1], STDOUT_FILENO);

        close(out_pipe[1]);
        close(in_pipe[0]);

        execl("/usr/bin/python3", "python3", "-u", "/Users/anishthewizard/Documents/Programming/wizardcraft/wizardcraft-server/src/cpp_lib/test.py", (char*)NULL);

        // error
    }
    else {
        // Parent Process
        // In perspective of the parent

        close(in_pipe[1]);
        close(out_pipe[0]);

        fcntl(out_pipe[1], F_SETFL, O_NONBLOCK);

        std::string cmd;
        char buffer[256];

        while (true) {
            ssize_t bytes_read = read(in_pipe[0], buffer, sizeof(buffer) - 1);
            if (bytes_read > 0) {
                buffer[bytes_read] = '\0';
                std::cout << buffer;
            }

            if(std::getline(std::cin, cmd)) {
                cmd += "\n";
                // write(out_write_pipe_end, command, size_of_cmd)
                write(out_pipe[1], cmd.c_str(), cmd.size());
            }
        }

        close(out_pipe[1]);
        close(in_pipe[0]);

        waitpid(pid, nullptr, 0);
    }

    return 0;
}
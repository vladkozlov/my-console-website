<template>
  <div class="console draggable" v-draggable ref="terminal">
    <div class="header unselectable" ref="draggable-area">
      <span class="header-title">terminal</span>
      <div class="header-buttons-block">
        <div
          class="header-button"
          :style="`background-color: ${btn.color}`"
          v-for="(btn,i) in btns"
          :key="`windowBtn-${i}`"
        />
      </div>
    </div>

    <div class="content" ref="content">
      <p v-for="(line, i) in history" :key="`line-${i}`" v-html="line"></p>
      <p>
        <span v-html="promt"></span>
        <span ref="userinput" contenteditable="true" class="input" @keypress.enter="submitCommand" @blur="onUserInputBlurChange" @keydown="onUserInputKeyDown"/>
      </p>
    </div>
  </div>
</template>

<script>
import draggable from "../utils/DraggableDirective";
import datajson from "../assets/data.json";

export default {
  props: {
    scrW: {
      type: Number,
      default: 0
    },
    scrH: {
      type: Number,
      default: 0
    },
    isMoved: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentLanguage: navigator.language,
      consoleMoved: false,
      user: "guest",
      btns: [{ color: "#4ECB2F" }, { color: "#E6C138" }, { color: "#FA6253" }],
      history: [],
      currentDir: [],
      structure: {
        type: "folder",
        about: {
          type: "file",
          format: "txt"
        },
        contact: {
          type: "file",
          format: "txt"
        },
        resume: {
          type: "file",
          format: "txt"
        },
        projects: {
          type: "folder"
        },
        skills: {
          type: "folder",
          proficient: {
            type: "file",
            format: "txt"
          },
          familiar: {
            type: "file",
            format: "txt"
          },
          learning: {
            type: "file",
            format: "txt"
          }
        }
      }
    };
  },
  watch: {
    scrW(newV, oldV) {
      if (!this.isMoved) {
        this.$refs.terminal.style.left = Math.floor(newV / 2 - this.$refs.terminal.clientWidth/2) + 'px';
      }
    },
    scrH(newV, oldV) {
      if (!this.isMoved) {
        this.$refs.terminal.style.top = Math.floor(newV / 2 - this.$refs.terminal.clientHeight/2) + 'px';
      }
    },
  },
  computed: {
    promt() {
      let dir_str = this.currentDir.reduce(
        (accum, current) => `${accum}/${current}`,
        "~"
      );
      return `<b>${
        this.user
      }@server:<span class="blue">${dir_str}</span>$ </b>`;
    },
    userInput: {
      get() {
        return this.$refs.userinput.textContent;
      },
      set(value) {
        this.$refs.userinput.textContent = value;
      }
    }
  },
  methods: {
    submitCommand(e) {
      let promt = e.target;
      let inputText = promt.textContent;
      let input = promt.textContent.trim().split(" ");

      this.pushToHistory(`${this.promt}${inputText}`);
      this.clearPromt();
      e.preventDefault();

      try {
        let data_to_push = this.parseCommand(input);
        this.pushRespToHistory(data_to_push);
      } catch (err) {
        this.pushToHistory(
          `Error: unknown error while command parsing. Thats all I know.`
        );
        console.error(err);
      }
    },
    onUserInputBlurChange(e) {
      var elm = e.target;
      setTimeout(function() {
        elm.focus();
      });
    },
    onUserInputKeyDown(e) {
      const TAB = 9
      var key = e.which || e.keyCode;
      if (key == TAB) e.preventDefault();
    },
    parseCommand(input) {
      let cmd = input[0];
      let args = input.slice(1);
      let resp = [];
      let path = null;

      switch (cmd) {
        case "help":
          resp.push(`<br/>`);
          resp.push("<b class='tab'>• cat FILENAME </b> - read FILENAME in current directory ");
          resp.push(
            "<b class='tab'>• cd DIRECTORY </b> - change directory to DIRECTORY or just cd to return to root."
          );
          resp.push(
            "<b class='tab'>• ls</b> - show files and folders in current directory. Folders marked as blue"
          );
          resp.push("<b class='tab'>• chname</b> - change current user name. Default: guest");
          resp.push("<b class='tab'>• clear</b> - clear terminal");
          resp.push("<b class='tab'>• help</b> - this help file");
          resp.push(`<br/>`);
          break;

        case "clear":
          this.clearHistory();
          break;

        case "ls":
          let resp_str = "";
          path = this.structure;
          if (this.currentDir.length !== 0) {
            this.currentDir.forEach(el => {
              path = path[el];
            });
          }

          Object.keys(path).forEach(el => {
            if (el != "type") {
              if (path[el].type === "folder") {
                resp_str += `<b class="tab skyblue">${el}</b>`;
              } else {
                resp_str += `<span class="tab">${el}.${path[el].format}</span>`;
              }
            }
          });
          resp.push(resp_str);
          break;

        case "cd":
          let resp_str2 = "";
          if (args.length === 0) {
            this.currentDir = [];
          } else {
            let moveto = args[0].split("/");
            path = this.structure;

            moveto.forEach(el => {
              if (el === "..") {
                this.currentDir.pop();
              } else if (path[el]) {
                path = path[el];
                this.currentDir.push(el);
              } else {
                resp_str2 = `Error: no such directory '${el}'`;
              }
            });
          }
          resp.push(resp_str2);
          break;

        case "cat":
          let file = args[0];

          if (file) {
            let filename = file.split(".")[0];
            if (this.currDirHasFile(filename)) {
              if (datajson[filename]) {
                resp.push(`<br/>`);
                resp.push(datajson[filename]);
                resp.push(`<br/>`);
              } else {
                resp.push(`Error: file is empty.`);
              }
            } else {
              resp.push(`Error: No such file in current directory.`);
            }
          } else {
            resp.push(`Error: you did not specify a file name`);
          }
          break;

        case "":
          //do nothing
          break;
        case "chname":
          if (args[0]) {
            this.user = args[0]
          } else {
            this.user = 'guest'
          }
          break
        default:
          resp.push("Error: command is not recognized.");
          break;
      }

      return resp;
    },
    currDirHasFile(filename) {
      let path = this.structure;
      if (this.currentDir.length !== 0) {
        this.currentDir.forEach(el => {
          path = path[el];
        });
      }

      let file = Object.keys(path).find(key => key === filename && path[key].type==='file');

      return file ? true : false;
    },
    pushToHistory(str) {
      this.history.push(str);
    },
    pushRespToHistory(arr) {
      arr.forEach(el => {
        this.history.push(el);
      });
    },
    clearHistory() {
      this.history = [];
    },
    clearPromt() {
      this.$refs.userinput.textContent = "";
    },
    scrollContentToBottom() {
      this.$refs.content.scrollTop = this.$refs.content.scrollHeight;
    }
  },
  directives: {
    draggable
  },
  updated() {
    this.scrollContentToBottom();
  },
  mounted() {
    this.$refs.userinput.focus();
    //set default position for terminal
    this.$refs.terminal.style.left = Math.floor(this.scrW / 2 - this.$refs.terminal.clientWidth/2) + 'px';
    this.$refs.terminal.style.top = Math.floor(this.scrH / 2 - this.$refs.terminal.clientHeight/2) + 'px';
    
    if (this.currentLanguage === "ru-RU") {
      this.history = [
        'Привет! Это CLI для работы с этим сайтом 😄 Набери `<b style="color: white">help</b>`, чтобы узнать доступные команды.',
        "Написано с ❤️ и ☕ Владиславом Козловым."
      ];
    } else {
      this.history = [
        "Hey! That's a CLI to interact with this site 😄 Type `<b style='color: white'>help</b>` to get started.",
        "Made with ❤️and ☕ by Vladislav Kozlov"
      ];
    }

  }
};
</script>

<style>
.console {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif, Helvetica, Arial;
  box-shadow: 0 22px 70px 4px rgba(0, 0, 0, 0.56);
  border-radius: 5px;
}

.input {
  display: inline-block;
  border: none;
  outline-color: rgba(0, 0, 0, 0);
}

.draggable {
  position: absolute;
  z-index: 9;
}

.header {
  cursor: move;
  height: 28px;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  background-color: #bdbdbd;
  border-radius: 5px 5px 0 0;
  padding-left: 15px;
  padding-right: 15px;
  z-index: 10;
}

.header-title {
  font: bold 0.9em arial, sans-serif;
  background-color: #565656;
  color: transparent;
  text-shadow: 2px 1px 7px rgba(255, 255, 255, 0.5);
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
}

.header-button {
  float: left;
  border-radius: 50%;
  margin-right: 6px;
  height: 12px;
  width: 12px;
}

.content {
  z-index: 10;
  width: 500px;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 5px 5px;
  padding: 10px;
  color: #3dd73d;
  overflow-y: auto;
}

.content::-webkit-scrollbar {
  -webkit-appearance: none;
}

.content::-webkit-scrollbar:vertical {
  width: 12px;
}

.content::-webkit-scrollbar:horizontal {
  height: 12px;
}

.content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.content::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);
}

.console .content p {
  font-size: 14px;
  margin: 0;
  margin-bottom: 5px;
}

.unselectable {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.tab {
  margin-left: 10px;
}

.newline {
  margin-bottom: 14px;
}

.blue {
  color: blue;
}
.skyblue {
  color: #03a9f4;
}
.console a {
  color: #e91e63;
}
.console a:visited {
  color: #e91e63;
}
</style>

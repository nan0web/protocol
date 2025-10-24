# @nan0web/protocol

|[Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Документація|Тестове покриття|Фічі|Версія npm|
|---|---|---|---|---|
|🟢 `99.7%`|🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/protocol/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/protocol/blob/main/docs/uk/README.md)|🟢 `100.0%`|✅ d.ts 📜 system.md 🕹️ playground|—|

Мінімалістичний протокол для виконання команд у середовищі, керованому повідомленнями. Він валідовує вхід, запускає команду (клас або функцію) і повертає структурований вихід.

## Встановлення

Як встановити через npm?
```bash
npm install @nan0web/protocol
```

Як встановити через pnpm?
```bash
pnpm add @nan0web/protocol
```

Як встановити через yarn?
```bash
yarn add @nan0web/protocol
```

## Базове використання – CommandProtocol

Протокол приймає підклас `ExecutableCommand` або просту функцію. Він зберігає історію оброблених повідомлень.

### Як створити CommandProtocol з класовою командою?
```js
class EchoCommand extends ExecutableCommand {
  name = "Echo"
  async run(msg) {
    return msg.argv.join(" ")
  }
}

const protocol = new CommandProtocol({
  command: new EchoCommand(),
  db: fs,
  logger: new NoConsole(),
})

const input = { value: "Echo hello world", time: Date.now() }
console.info(protocol.accepts(input)) // ← true

const out = await protocol.process(input)
console.info(out)
// { content: ["hello world"], error: null, meta: { source: "Echo" }, priority: 0 }
console.info(protocol.history[0].message)
// CommandMessage { body: "Echo hello world", head: {} }
```

### Як використати просту функцію як команду?
```js
const fn = (msg) => msg.argv.map(v => v.toUpperCase())

const protocol = new CommandProtocol({
  command: fn,
  db: fs,
  logger: new NoConsole(),
})

const input = { value: "fn hello planet", time: Date.now() }
const out = await protocol.process(input)

console.info(protocol.accepts(input)) // ← true
console.info(out.content) // ← ["HELLO", "PLANET"]
console.info(out.meta.source) // ← "fn"
```

## Об’єкт‑стильова команда

Повернення об’єкта дозволяє задати кастомні `content`, `priority` та `meta`.

### Як повернути об’єкт з команди?
```js
function ObjCmd(msg) {
  return {
    content: ["custom", ...msg.argv],
    priority: 7,
    meta: { extra: true },
  }
}

const protocol = new CommandProtocol({
  command: ObjCmd,
  db: fs,
  logger: new NoConsole(),
})

const input = { value: "ObjCmd a b", time: Date.now() }
const out = await protocol.process(input)

console.info(out.content) // ← ["custom", "a", "b"]
console.info(out.priority) // ← 7
console.info(out.meta) // ← { extra: true, source: "ObjCmd" }
```

## Відповідь за замовчуванням

Коли команда не повертає розпізнавану структуру.

### Як виглядає fallback?
```js
const fn = () => 12345

const protocol = new CommandProtocol({
  command: fn,
  db: fs,
  logger: new NoConsole(),
})

const input = { value: "fn any", time: Date.now() }
const out = await protocol.process(input)

console.info(out.content)
// [ "Command executed.", "(no output data)" ]
console.info(out.meta.source) // ← fn
```

## Обробка помилок

Викинуті помилки перехоплюються і позначаються як критичні (`priority: 100`).

### Як повідомляються помилки?
```js
const boom = () => {
  throw new Error("boom")
}

const protocol = new CommandProtocol({
  command: boom,
  db: fs,
  logger: new NoConsole(),
})

const input = { value: "boom test", time: Date.now() }
const out = await protocol.process(input)
console.info(out.content) // ← ["boom"]
console.info(out.priority) // ← 100
console.info(out.error instanceof Error) // ← true
console.info(out.meta.source) // ← boom
```

## API

Експортовані символи мають бути присутніми.  

Всі експортовані класи повинні бути доступні.

## TypeScript декларації

Пакет надає файли `.d.ts`.

## CLI Playground

Приклад команди для запуску скрипту playground.

### Як запустити скрипт playground?
```bash
npm run play
```

## Внесок

Як взяти участь? — [перегляньте тут](./CONTRIBUTING.md)

## Ліцензія

Як ліцензувати під ISC? — [перегляньте тут](./LICENSE)

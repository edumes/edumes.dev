# robot-contract

Estudo de caso: [Robôs que operam sistemas sem API, e um painel para comandá-los](https://edumes.dev/casos/orquestracao-rpa/) · Case study: [Robots that drive systems with no API, and a panel to command them](https://edumes.dev/en/cases/rpa-orchestration/)

**PT** · Um contrato pequeno e independente de linguagem entre um painel e os robôs que ele executa. O robô recebe `--config <arquivo.json>`, informa o progresso em JSON Lines no stdout e termina com um código de saída que tem significado: `0` sucesso, `1` erro, `2` parcial, `3` precisa de uma pessoa, `4` nada a fazer. Qualquer outro código conta como erro. Uma linha sem `step` herda a etapa anterior, uma linha que não é JSON vira `raw` sem quebrar nada, e `"reason": true` marca a linha que explica o resultado. O arquivo de configuração, que pode ter segredos, é apagado assim que o robô termina. Um robô travado é encerrado no tempo limite.

**EN** · A small, language-agnostic contract between a panel and the robots it runs. The robot gets `--config <file.json>`, reports progress as JSON Lines on stdout and exits with a code that carries meaning: `0` success, `1` error, `2` partial, `3` needs a person, `4` nothing to do. Any other code counts as an error. A line without `step` inherits the previous step, a non-JSON line becomes `raw` without breaking anything, and `"reason": true` marks the line that explains the outcome. The config file, which may hold secrets, is deleted as soon as the robot exits. A hung robot is stopped at the timeout.

Só biblioteca padrão. / Standard library only.

```bash
python3 check.py
```

- [runner.py](runner.py): `run(command, config, timeout)` returns the state, exit code, reason and events.
- [robot_example.py](robot_example.py): a demo robot whose parameters force each outcome.
- [check.py](check.py): drives the demo robot through every outcome, the timeout and the cleanup.

import { ChatInputCommandInteraction } from "discord.js";
import Command from "../../utils/common.commands.config";

export default class calculateCommand extends Command {
  constructor() {
    super("calculate", "Calculate a mathematical expression");

    this.addStringOption((option) =>
      option
        .setName("expression")
        .setDescription("Expression to calculate")
        .setRequired(true)
    );
  }

  action(interaction: ChatInputCommandInteraction): void {
    const input = interaction.options.getString("expression");

    if (!input) {
      interaction.reply("0");
      return;
    }

    try {
      const result: number | string = this.calculateExpression(input); // calculate value of expression

      interaction.reply(`\`${input} = ${result}\``); // output result
    } catch (error) {
      interaction.reply(error);
    }
  }

  /**
   * Calculate the value of the expression
   *
   * @param expression - expression to be calculated
   * @return value of the expression
   */
  calculateExpression(expression: string): number {
    const operations = ["E+", "E-", "+", "-", "*", "/", "^"]; // possible operatations in order of precedence
    let operation = "\0"; // string to store operation

    // assume blank expression has a value of 0
    if (!expression.length) {
      return 0;
    }

    // Calculate value of subexpressions in parentheses / functions

    expression = this.calculateFunction(expression, "sqrt", Math.sqrt);
    expression = this.calculateFunction(expression, "fact", this.factorial);

    expression = this.calculateFunction(expression, "log", Math.log10);
    expression = this.calculateFunction(expression, "ln", Math.log);

    expression = this.calculateFunction(expression, "arcsin", Math.asin);
    expression = this.calculateFunction(expression, "sin", Math.sin);

    expression = this.calculateFunction(expression, "arccos", Math.acos);
    expression = this.calculateFunction(expression, "cos", Math.cos);

    expression = this.calculateFunction(expression, "arctan", Math.atan);
    expression = this.calculateFunction(expression, "tan", Math.tan);

    expression = this.calculateSubexpressions(expression);

    // iterate to find operand with most precendence in expression
    for (const opp of operations) {
      if (expression.indexOf(opp) != -1) {
        operation = opp;
        break;
      }
    }

    // if no operand is found return value of expression
    if (operation == "\0") {
      // replace constants
      expression = expression.replace("pi", Math.PI.toString());
      expression = expression.replace("e", Math.E.toString());

      return Number.parseFloat(expression);
    }

    // split string into the two operands of the operation
    const operands = this.splitByOperation(expression, operation);

    // perform operation on operands and return result
    switch (operation) {
      case "E+":
        return (
          this.calculateExpression(operands[0]) *
          Math.pow(10, this.calculateExpression(operands[1]))
        );

      case "E-":
        return (
          this.calculateExpression(operands[0]) *
          Math.pow(10, -this.calculateExpression(operands[1]))
        );

      case "-":
        return (
          this.calculateExpression(operands[0]) -
          this.calculateExpression(operands[1])
        );

      case "+":
        return (
          this.calculateExpression(operands[0]) +
          this.calculateExpression(operands[1])
        );

      case "*":
        return (
          this.calculateExpression(operands[0]) *
          this.calculateExpression(operands[1])
        );

      case "/":
        return (
          this.calculateExpression(operands[0]) /
          this.calculateExpression(operands[1])
        );

      case "^":
        return Math.pow(
          this.calculateExpression(operands[0]),
          this.calculateExpression(operands[1]),
        );
    }

    return Number.MAX_VALUE;
  }

  factorial(x: number): number {
    let res = 1;

    x = Math.round(x);

    for (; x > 1; x--) {
      res *= x;
    }

    return res;
  }

  /**
   * Replace function with their respective values
   *
   * @param expression - mathematical expression
   * @param funcName - name of function
   * @param func - method
   * @returns - resultant expression
   */

  calculateFunction(
    expression: string,
    funcName: string,
    func: (number) => number,
  ): string {
    let startIdx = expression.indexOf(funcName);

    while (startIdx != -1) {
      // find related close parenthesis
      const endIdx = this.findCloseParenthesis(
        expression,
        startIdx + funcName.length,
      );

      const subexpression = expression.substring(
        startIdx + funcName.length + 1,
        endIdx - 1,
      );

      const value = func(this.calculateExpression(subexpression));

      // replace subexpression with value
      expression = expression.substring(0, startIdx) +
        value.toString().replace("e", "E") +
        expression.substring(endIdx);

      // find next subexpression
      startIdx = expression.indexOf(funcName);
    }

    return expression;
  }

  /**
   * Replace Subexpression in parentheses with their value
   *
   * @param expression
   * @return resulting expression
   */

  calculateSubexpressions(expression: string): string {
    let startIdx = expression.indexOf("("); // find the index of open parenthesis

    while (startIdx != -1) {
      // find related close parenthesis
      const endIdx = this.findCloseParenthesis(expression, startIdx);

      // extract subexpression
      const subexpression = expression.substring(startIdx + 1, endIdx - 1);

      // calculate value of subexpression
      const value = this.calculateExpression(subexpression);

      // replace subexpression with value
      expression = expression.substring(0, startIdx) +
        value +
        expression.substring(endIdx);

      // find next subexpression
      startIdx = expression.indexOf("(");
    }

    return expression;
  }

  /**
   * Find related close parenthesis
   *
   * @param expression - expression with parentheses
   * @param startIdx - index of open parenthesis
   * @return index of close parenthesis
   */
  findCloseParenthesis(expression: string, startIdx: number): number {
    const length = expression.length;
    let parenthesesCount = 1;
    let endIdx = startIdx + 1;

    for (; parenthesesCount != 0; endIdx++) {
      // exit program if invalid number of parentheses
      if (endIdx == length) {
        throw "`Invalid number of parentheses`";
      }

      if (expression.charAt(endIdx) == "(") {
        parenthesesCount++;
      } else if (expression.charAt(endIdx) == ")") {
        parenthesesCount--;
      }
    }

    return endIdx;
  }

  /**
   * Split the operands of a binary operator
   *
   * @param expression - expression to separate
   * @param operation - operation to separate by
   * @return array of strings with separated operands
   */
  splitByOperation(expression: string, operation: string): string[] {
    const result = ["", ""];

    // get index of operation
    const position = expression.lastIndexOf(operation);

    // split first half
    result[0] = expression.substring(0, position);

    // split second half
    result[1] = expression.substring(position + operation.length);

    return result;
  }
}

import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class calculateCommand extends Command {
  constructor() {
    super('calculate', [
      'Calculate a mathematical expression',
      'Usage: $calculate <expression>',
    ]);
  }

  action(message: Message, args: string[]) {
    let input = args.slice(1).join('');

    try {
      let result = this.calculateExpression(input); // calculate value of expression

      message.channel.send(`\`Result: ${result}\``); // output value
    } catch (error) {
      message.channel.send(error);
    }
  }

  /**
   * Calculate the value of the expression
   *
   * @param expression - expression to be calculated
   * @return value of the expression
   */
  calculateExpression(expression: string): number {
    let operations = ['+', '-', '*', '/', '^']; // possible operatations in order of precedence
    let operation = '\0'; // string to store operation

    // assume blank expression has a value of 0
    if (!expression) {
      return 0;
    }

    // Calculate value of subexpressions in parentheses
    try {
      expression = this.calculateSubexpressions(expression);
    } catch (error) {
      throw error;
    }

    // iterate to find operand with most precendence in expression
    for (let opp of operations) {
      if (expression.indexOf(opp) != -1) {
        operation = opp;
        break;
      }
    }

    // if no operand is found return value of expression
    if (operation == '\0') {
      return Number.parseFloat(expression);
    }

    // split string into the two operands of the operation
    let operands = this.splitByOperation(expression, operation);

    // perform operation on operands and return result
    switch (operation) {
      case '-':
        return (
          this.calculateExpression(operands[0]) -
          this.calculateExpression(operands[1])
        );

      case '+':
        return (
          this.calculateExpression(operands[0]) +
          this.calculateExpression(operands[1])
        );

      case '*':
        return (
          this.calculateExpression(operands[0]) *
          this.calculateExpression(operands[1])
        );

      case '/':
        return (
          this.calculateExpression(operands[0]) /
          this.calculateExpression(operands[1])
        );

      case '^':
        return Math.pow(
          this.calculateExpression(operands[0]),
          this.calculateExpression(operands[1])
        );
    }

    return Number.MAX_VALUE;
  }

  /**
   * Replace Subexpression in parentheses with their value
   *
   * @param expression
   * @return resulting expression
   */

  calculateSubexpressions(expression: string): string {
    let startIdx = expression.indexOf('('); // find the index of open parenthesis

    while (startIdx != -1) {
      // find related close parenthesis
      let endIdx: number;

      try {
        endIdx = this.findCloseParenthesis(expression, startIdx);
      } catch (error) {
        throw error;
      }

      // extract subexpression
      let subexpression = expression.substring(startIdx + 1, endIdx - 1);

      // calculate value of subexpression
      let value = this.calculateExpression(subexpression);

      // replace subexpression with value
      expression =
        expression.substring(0, startIdx) +
        value +
        expression.substring(endIdx);

      // find next subexpression
      startIdx = expression.indexOf('(');
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
    let length = expression.length;
    let parenthesesCount = 1;
    let endIdx = startIdx + 1;

    for (; parenthesesCount != 0; endIdx++) {
      // exit program if invalid number of parentheses
      if (endIdx == length) {
        throw 'Invalid number of parentheses';
      }

      if (expression.charAt(endIdx) == '(') {
        parenthesesCount++;
      } else if (expression.charAt(endIdx) == ')') {
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
    let result = ['', ''];

    // get index of operation
    let position = expression.lastIndexOf(operation);

    // split first half
    result[0] = expression.substring(0, position);

    // split second half
    result[1] = expression.substring(position + 1);

    return result;
  }
}

import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class calculateCommand extends Command {
  constructor() {
    super(
      'Calculate',
      'calculate',
      ['Calculate a mathematical expression', 'Usage: $calculate <expression>'],
      ['calc']
    );
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

    // format expression
    expression = expression.toLowerCase();

    // assume blank expression has a value of 0
    if (!expression.length) {
      return 0;
    }

    // replace constants
    expression = expression.replace('pi', Math.PI.toString());
    expression = expression.replace('e', Math.E.toString());

    // Calculate value of subexpressions in parentheses / functions
    try {
      expression = this.calculateFunction(expression, 'sqrt', Math.sqrt);

      expression = this.calculateFunction(expression, 'fact', this.factorial);

      expression = this.calculateFunction(expression, 'log', Math.log10);
      expression = this.calculateFunction(expression, 'ln', Math.log);

      expression = this.calculateFunction(expression, 'arcsin', Math.asin);
      expression = this.calculateFunction(expression, 'sin', Math.sin);

      expression = this.calculateFunction(expression, 'arccos', Math.acos);
      expression = this.calculateFunction(expression, 'cos', Math.cos);

      expression = this.calculateFunction(expression, 'arctan', Math.atan);
      expression = this.calculateFunction(expression, 'tan', Math.tan);

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

  factorial(x: number): number {
    let res = 1;

    x = Math.round(x);

    for (; x > 1; x--) {
      res *= x;
    }

    return x;
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
    func: (number) => number
  ) {
    let startIdx = expression.indexOf(funcName);

    while (startIdx != -1) {
      // find related close parenthesis
      let endIdx: number;

      try {
        endIdx = this.findCloseParenthesis(
          expression,
          startIdx + funcName.length
        );
      } catch (error) {
        throw error;
      }

      let subexpression = expression.substring(
        startIdx + funcName.length + 1,
        endIdx - 1
      );

      let value = this.calculateExpression(subexpression);

      // replace subexpression with value
      expression =
        expression.substring(0, startIdx) +
        func(value) +
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
        throw '`Invalid number of parentheses`';
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

/**
 * @file Typescript grammar rules generated from Typescript compiler developed by Microsoft.
 * @author FXTi <fx.ti@outlook.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'javascript',

  externals: $ => [
    $._automatic_semicolon,
    $._template_chars,
    $._ternary_qmark,
    $.html_comment,
    '||', // DO NOT REMOVE, OR RULES WILL BREAK, BELIEVE ME!!!
    $.escape_sequence,
    $.regex_pattern,
    $.jsx_text,
  ],

  extras: $ => [
    $.comment,
    $.html_comment,
    /[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/u,
  ],

  inline: $ => [
    $._call_signature,
    $._formal_parameter,
    $._expressions,
    $._semicolon,
    $._identifier,
    $._reserved_identifier,
    $._jsx_attribute,
    $._jsx_element_name,
    $._jsx_child,
    $._jsx_element,
    $._jsx_attribute_name,
    $._jsx_attribute_value,
    $._jsx_identifier,
    $._lhs_expression,
  ],

  precedences: $ => [
    [
      'member',
      'template_call',
      'call',
      $.update_expression,
      'unary_void',
      'binary_times',
      'binary_plus',
      'binary_shift',
      'binary_compare',
      'binary_relation',
      'binary_equality',
      'bitwise_and',
      'bitwise_xor',
      'bitwise_or',
      'logical_and',
      'logical_or',
      'ternary',
      $.sequence_expression,
      $.arrow_function,
    ],
    ['assign', $.primary_expression],
    ['member', 'template_call', 'new', 'call', $.expression],
    ['declaration', 'literal'],
    [$.primary_expression, $.statement_block, 'object'],
    [$.meta_property, $.import],
    [$.import_statement, $.import],
    [$.export_statement, $.primary_expression],
    [$.lexical_declaration, $.primary_expression],
  ],

  conflicts: $ => [
    [$.primary_expression, $._property_name],
    [$.primary_expression, $.method_definition],
    [$.primary_expression, $.rest_pattern],
    [$.primary_expression, $.pattern],
    [$.primary_expression, $._for_header],
    [$.variable_declarator, $._for_header],
    [$.array, $.array_pattern],
    [$.object, $.object_pattern],
    [$.assignment_expression, $.pattern],
    [$.assignment_expression, $.object_assignment_pattern],
    [$.labeled_statement, $._property_name],
    [$.computed_property_name, $.array],
    [$.binary_expression, $._initializer],
  ],

  word: $ => $.identifier,

  rules: {
    program: $ => seq(
      optional($.hash_bang_line),
      repeat($.statement),
    ),

    hash_bang_line: _ => /#!.*/,

    export_statement: $ => choice(
      seq(
        'export',
        choice(
          seq('*', $._from_clause),
          seq($.export_clause, $._from_clause),
          $.export_clause,
        ),
        $._semicolon,
      ),
      seq(
        'export',
        choice(
          field('declaration', $.declaration),
          seq(
            'default',
            field('default', choice(
              field('declaration', $.declaration),
              seq(
                field('value', $.expression),
                $._semicolon,
              ),
            )),
          ),
        ),
      ),
    ),

    export_clause: $ => seq(
      '{',
      optional(sepBy(',', $.export_specifier)),
      optional(','),
      '}',
    ),

    export_specifier: $ => seq(
      field('name', $.identifier),
      optional(seq(
        'as',
        field('alias', $.identifier),
      )),
    ),

    declaration: $ => choice(
      $.function_declaration,
      $.generator_function_declaration,
      $.class_declaration,
      $.lexical_declaration,
      $.variable_declaration,
    ),

    import: _ => token('import'),

    import_statement: $ => seq(
      'import',
      choice(
        seq($.import_clause, $._from_clause),
        field('source', $.string),
      ),
      $._semicolon,
    ),

    import_clause: $ => choice(
      $.namespace_import,
      $.named_imports,
      seq(
        $.identifier,
        optional(seq(
          ',',
          choice(
            $.namespace_import,
            $.named_imports,
          ),
        )),
      ),
    ),

    _from_clause: $ => seq(
      'from', field('source', $.string),
    ),

    namespace_import: $ => seq(
      '*', 'as', $.identifier,
    ),

    named_imports: $ => seq(
      '{',
      optional(sepBy(',', $.import_specifier)),
      optional(','),
      '}',
    ),

    import_specifier: $ => choice(
      field('name', $.identifier),
      seq(
        field('name', $.identifier),
        'as',
        field('alias', $.identifier),
      ),
    ),

    statement: $ => choice(
      $.export_statement,
      $.import_statement,
      $.debugger_statement,
      $.expression_statement,
      $.declaration,
      $.statement_block,

      $.if_statement,
      $.switch_statement,
      $.for_statement,
      $.for_in_statement,
      $.while_statement,
      $.do_statement,
      $.try_statement,
      $.with_statement,

      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.throw_statement,
      $.empty_statement,
      $.labeled_statement,
    ),

    expression_statement: $ => seq(
      $._expressions,
      $._semicolon,
    ),

    variable_declaration: $ => seq(
      'var',
      sepBy(',', $.variable_declarator),
      $._semicolon,
    ),

    lexical_declaration: $ => seq(
      field('kind', choice('let', 'const')),
      sepBy(',', $.variable_declarator),
      $._semicolon,
    ),

    variable_declarator: $ => seq(
      field('name', choice($.identifier, $._destructuring_pattern)),
      optional($._initializer),
    ),

    statement_block: $ => prec.right(seq(
      '{',
      repeat($.statement),
      '}',
      optional($._automatic_semicolon),
    )),

    else_clause: $ => seq('else', $.statement),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $.statement),
      optional(field('alternative', $.else_clause)),
    )),

    switch_statement: $ => seq(
      'switch',
      field('value', $.parenthesized_expression),
      field('body', $.switch_body),
    ),

    for_statement: $ => seq(
      'for',
      '(',
      choice(
        field('initializer', choice($.lexical_declaration, $.variable_declaration)),
        seq(field('initializer', $._expressions), ';'),
        field('initializer', $.empty_statement),
      ),
      field('condition', choice(
        seq($._expressions, ';'),
        $.empty_statement,
      )),
      field('increment', optional($._expressions)),
      ')',
      field('body', $.statement),
    ),

    for_in_statement: $ => seq(
      'for',
      $._for_header,
      field('body', $.statement),
    ),

    _for_header: $ => seq(
      '(',
      choice(
        field('left', choice(
          $._lhs_expression,
          $.parenthesized_expression,
        )),
        seq(
          field('kind', 'var'),
          field('left', choice(
            $.identifier,
            $._destructuring_pattern,
          )),
          optional($._initializer),
        ),
        seq(
          field('kind', choice('let', 'const')),
          field('left', choice(
            $.identifier,
            $._destructuring_pattern,
          )),
          optional($._automatic_semicolon),
        ),
      ),
      field('operator', choice('in', 'of')),
      field('right', $._expressions),
      ')',
    ),

    while_statement: $ => seq(
      'while',
      field('condition', $.parenthesized_expression),
      field('body', $.statement),
    ),

    do_statement: $ => prec.right(seq(
      'do',
      field('body', $.statement),
      'while',
      field('condition', $.parenthesized_expression),
      optional($._semicolon),
    )),

    try_statement: $ => seq(
      'try',
      field('body', $.statement_block),
      optional(field('handler', $.catch_clause)),
      optional(field('finalizer', $.finally_clause)),
    ),

    with_statement: $ => seq(
      'with',
      field('object', $.parenthesized_expression),
      field('body', $.statement),
    ),

    break_statement: $ => seq(
      'break',
      field('label', optional(alias($.identifier, $.statement_identifier))),
      $._semicolon,
    ),

    continue_statement: $ => seq(
      'continue',
      field('label', optional(alias($.identifier, $.statement_identifier))),
      $._semicolon,
    ),

    debugger_statement: $ => seq(
      'debugger',
      $._semicolon,
    ),

    return_statement: $ => seq(
      'return',
      optional($._expressions),
      $._semicolon,
    ),

    throw_statement: $ => seq(
      'throw',
      $._expressions,
      $._semicolon,
    ),

    empty_statement: _ => ';',

    labeled_statement: $ => prec.dynamic(-1, seq(
      field('label', alias(choice($.identifier, $._reserved_identifier), $.statement_identifier)),
      ':',
      field('body', $.statement),
    )),

    switch_body: $ => seq(
      '{',
      repeat(choice($.switch_case, $.switch_default)),
      '}',
    ),

    switch_case: $ => seq(
      'case',
      field('value', $._expressions),
      ':',
      field('body', repeat($.statement)),
    ),

    switch_default: $ => seq(
      'default',
      ':',
      field('body', repeat($.statement)),
    ),

    catch_clause: $ => seq(
      'catch',
      '(', field('parameter', choice($.identifier, $._destructuring_pattern)), ')',
      field('body', $.statement_block),
    ),

    finally_clause: $ => seq(
      'finally',
      field('body', $.statement_block),
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._expressions,
      ')',
    ),

    _expressions: $ => choice(
      $.expression,
      $.sequence_expression,
    ),

    expression: $ => choice(
      $.primary_expression,
      $._jsx_element,
      $.assignment_expression,
      $.augmented_assignment_expression,
      $.unary_expression,
      $.binary_expression,
      $.ternary_expression,
      $.update_expression,
      $.new_expression,
      $.yield_expression,
    ),

    primary_expression: $ => choice(
      $.subscript_expression,
      $.member_expression,
      $.parenthesized_expression,
      $._identifier,
      alias($._reserved_identifier, $.identifier),
      $.this,
      $.super,
      $.number,
      $.string,
      $.template_string,
      $.regex,
      $.true,
      $.false,
      $.null,
      $.object,
      $.array,
      $.function_expression,
      $.arrow_function,
      $.generator_function,
      $.class,
      $.meta_property,
      $.call_expression,
    ),

    yield_expression: $ => prec.right(seq(
      'yield',
      choice(
        seq('*', $.expression),
        optional($.expression),
      ))),

    object: $ => prec('object', seq(
      '{',
      optional(sepBy(',', optional(choice(
        $.pair,
        $.method_definition,
        alias(
          choice($.identifier, $._reserved_identifier),
          $.shorthand_property_identifier,
        ),
      )))),
      '}',
    )),

    object_pattern: $ => prec('object', seq(
      '{',
      optional(sepBy(',', optional(choice(
        $.pair_pattern,
        $.object_assignment_pattern,
        alias(
          choice($.identifier, $._reserved_identifier),
          $.shorthand_property_identifier_pattern,
        ),
      )))),
      '}',
    )),

    assignment_pattern: $ => seq(
      field('left', $.pattern),
      '=',
      field('right', $.expression),
    ),

    object_assignment_pattern: $ => seq(
      field('left', choice(
        alias(choice($._reserved_identifier, $.identifier), $.shorthand_property_identifier_pattern),
        $._destructuring_pattern,
      )),
      '=',
      field('right', $.expression),
    ),

    array: $ => seq(
      '[',
      optional(sepBy(',', optional(choice(
        $.expression,
        $.spread_element,
      )))),
      ']',
    ),

    array_pattern: $ => seq(
      '[',
      optional(sepBy(',', optional(choice(
        $.pattern,
        $.assignment_pattern,
      )))),
      ']',
    ),

    _jsx_element: $ => choice($.jsx_element, $.jsx_self_closing_element),

    jsx_element: $ => seq(
      field('open_tag', $.jsx_opening_element),
      repeat($._jsx_child),
      field('close_tag', $.jsx_closing_element),
    ),

    html_character_reference: _ => /&(#([xX][0-9a-fA-F]{1,6}|[0-9]{1,5})|[A-Za-z]{1,30});/,

    jsx_expression: $ => seq(
      '{',
      optional(choice(
        $.expression,
        $.sequence_expression,
        $.spread_element,
      )),
      '}',
    ),

    _jsx_child: $ => choice(
      $.jsx_text,
      $.html_character_reference,
      $._jsx_element,
      $.jsx_expression,
    ),

    jsx_opening_element: $ => prec.dynamic(-1, seq(
      '<',
      optional(seq(
        field('name', $._jsx_element_name),
        repeat(field('attribute', $._jsx_attribute)),
      )),
      '>',
    )),

    jsx_identifier: _ => /[a-zA-Z_$][a-zA-Z\d_$]*-[a-zA-Z\d_$\-]*/,

    _jsx_identifier: $ => choice(
      alias($.jsx_identifier, $.identifier),
      $.identifier,
    ),

    nested_identifier: $ => prec('member', seq(
      field('object', choice($.identifier, alias($.nested_identifier, $.member_expression))),
      '.',
      field('property', alias($.identifier, $.property_identifier)),
    )),

    jsx_namespace_name: $ => seq($._jsx_identifier, ':', $._jsx_identifier),

    _jsx_element_name: $ => choice(
      $._jsx_identifier,
      alias($.nested_identifier, $.member_expression),
      $.jsx_namespace_name,
    ),

    jsx_closing_element: $ => seq(
      '</',
      optional(field('name', $._jsx_element_name)),
      '>',
    ),

    jsx_self_closing_element: $ => seq(
      '<',
      field('name', $._jsx_element_name),
      repeat(field('attribute', $._jsx_attribute)),
      '/>',
    ),

    _jsx_attribute: $ => choice($.jsx_attribute, $.jsx_expression),

    _jsx_attribute_name: $ => choice(alias($._jsx_identifier, $.property_identifier), $.jsx_namespace_name),

    jsx_attribute: $ => seq(
      $._jsx_attribute_name,
      optional(seq(
        '=',
        $._jsx_attribute_value,
      )),
    ),

    _jsx_string: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias($.unescaped_double_jsx_string_fragment, $.string_fragment),
          $.html_character_reference,
        )),
        '"',
      ),
      seq(
        '\'',
        repeat(choice(
          alias($.unescaped_single_jsx_string_fragment, $.string_fragment),
          $.html_character_reference,
        )),
        '\'',
      ),
    ),

    unescaped_double_jsx_string_fragment: _ => token.immediate(prec(1, /([^"&]|&[^#A-Za-z])+/)),

    unescaped_single_jsx_string_fragment: _ => token.immediate(prec(1, /([^'&]|&[^#A-Za-z])+/)),

    _jsx_attribute_value: $ => choice(
      alias($._jsx_string, $.string),
      $.jsx_expression,
      $._jsx_element,
    ),

    class: $ => prec('literal', seq(
      'class',
      field('name', optional($.identifier)),
      optional($.class_heritage),
      field('body', $.class_body),
    )),

    class_declaration: $ => prec('declaration', seq(
      'class',
      field('name', $.identifier),
      optional($.class_heritage),
      field('body', $.class_body),
      optional($._automatic_semicolon),
    )),

    class_heritage: $ => seq('extends', $.expression),

    function_expression: $ => prec('literal', seq(
      'function',
      field('name', optional($.identifier)),
      $._call_signature,
      field('body', $.statement_block),
    )),

    function_declaration: $ => prec.right('declaration', seq(
      'function',
      field('name', $.identifier),
      $._call_signature,
      field('body', $.statement_block),
      optional($._automatic_semicolon),
    )),

    generator_function: $ => prec('literal', seq(
      'function',
      '*',
      field('name', optional($.identifier)),
      $._call_signature,
      field('body', $.statement_block),
    )),

    generator_function_declaration: $ => prec.right('declaration', seq(
      'function',
      '*',
      field('name', $.identifier),
      $._call_signature,
      field('body', $.statement_block),
      optional($._automatic_semicolon),
    )),

    arrow_function: $ => seq(
      choice(
        field('parameter', choice(
          alias($._reserved_identifier, $.identifier),
          $.identifier,
        )),
        $._call_signature,
      ),
      '=>',
      field('body', choice(
        $.expression,
        $.statement_block,
      )),
    ),

    _call_signature: $ => field('parameters', $.formal_parameters),
    _formal_parameter: $ => choice($.pattern, $.assignment_pattern),

    call_expression: $ => choice(
      prec('call', seq(
        field('function', $.expression),
        field('arguments', $.arguments),
      )),
      prec('template_call', seq(
        field('function', choice($.primary_expression, $.new_expression)),
        field('arguments', $.template_string),
      )),
    ),

    new_expression: $ => prec.right('new', seq(
      'new',
      field('constructor', choice($.primary_expression, $.new_expression)),
      field('arguments', optional(prec.dynamic(1, $.arguments))),
    )),

    member_expression: $ => prec('member', seq(
      field('object', choice($.expression, $.primary_expression, $.import)),
      '.',
      field('property', alias($.identifier, $.property_identifier)),
    )),

    subscript_expression: $ => prec.right('member', seq(
      field('object', choice($.expression, $.primary_expression)),
      '[', field('index', $._expressions), ']',
    )),

    _lhs_expression: $ => choice(
      $.member_expression,
      $.subscript_expression,
      $._identifier,
      alias($._reserved_identifier, $.identifier),
      $._destructuring_pattern,
    ),

    assignment_expression: $ => prec.right('assign', seq(
      field('left', choice($.parenthesized_expression, $._lhs_expression)),
      '=',
      field('right', $.expression),
    )),

    _augmented_assignment_lhs: $ => choice(
      $.member_expression,
      $.subscript_expression,
      alias($._reserved_identifier, $.identifier),
      $.identifier,
      $.parenthesized_expression,
    ),

    augmented_assignment_expression: $ => prec.right('assign', seq(
      field('left', $._augmented_assignment_lhs),
      field('operator', choice('+=', '-=', '*=', '/=', '%=', '^=', '&=', '|=', '>>=', '>>>=',
        '<<=')),
      field('right', $.expression),
    )),

    _initializer: $ => seq(
      '=',
      field('value', $.expression),
    ),

    _destructuring_pattern: $ => choice(
      $.object_pattern,
      $.array_pattern,
    ),

    spread_element: $ => seq('...', $.expression),

    ternary_expression: $ => prec.right('ternary', seq(
      field('condition', $.expression),
      alias($._ternary_qmark, '?'),
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression),
    )),

    binary_expression: $ => choice(
      ...[
        ['&&', 'logical_and'],
        ['||', 'logical_or'],
        ['>>', 'binary_shift'],
        ['>>>', 'binary_shift'],
        ['<<', 'binary_shift'],
        ['&', 'bitwise_and'],
        ['^', 'bitwise_xor'],
        ['|', 'bitwise_or'],
        ['+', 'binary_plus'],
        ['-', 'binary_plus'],
        ['*', 'binary_times'],
        ['/', 'binary_times'],
        ['%', 'binary_times'],
        ['<', 'binary_relation'],
        ['<=', 'binary_relation'],
        ['==', 'binary_equality'],
        ['===', 'binary_equality'],
        ['!=', 'binary_equality'],
        ['!==', 'binary_equality'],
        ['>=', 'binary_relation'],
        ['>', 'binary_relation'],
        ['instanceof', 'binary_relation'],
        ['in', 'binary_relation'],
      ].map(([operator, precedence, associativity]) =>
        (associativity === 'right' ? prec.right : prec.left)(precedence, seq(
          field('left', $.expression),
          field('operator', operator),
          field('right', $.expression),
        )),
      ),
    ),

    unary_expression: $ => prec.left('unary_void', seq(
      field('operator', choice('!', '~', '-', '+', 'typeof', 'void', 'delete')),
      field('argument', $.expression),
    )),

    update_expression: $ => prec.left(choice(
      seq(
        field('argument', $.expression),
        field('operator', choice('++', '--')),
      ),
      seq(
        field('operator', choice('++', '--')),
        field('argument', $.expression),
      ),
    )),

    sequence_expression: $ => prec.right(sepBy(',', $.expression)),

    string: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias($.unescaped_double_string_fragment, $.string_fragment),
          $.escape_sequence,
        )),
        '"',
      ),
      seq(
        '\'',
        repeat(choice(
          alias($.unescaped_single_string_fragment, $.string_fragment),
          $.escape_sequence,
        )),
        '\'',
      ),
    ),

    unescaped_double_string_fragment: _ => token.immediate(prec(1, /[^"\\\r\n]+/)),

    unescaped_single_string_fragment: _ => token.immediate(prec(1, /[^'\\\r\n]+/)),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[^xu0-7]/,
        /[0-7]{1,3}/,
        /x[0-9a-fA-F]{2}/,
        /u[0-9a-fA-F]{4}/,
        /u\{[0-9a-fA-F]+\}/,
        /[\r?][\n\u2028\u2029]/,
      ),
    )),

    comment: _ => token(choice(
      seq('//', /[^\r\n\u2028\u2029]*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),

    template_string: $ => seq(
      '`',
      repeat(choice(
        alias($._template_chars, $.string_fragment),
        $.escape_sequence,
        $.template_substitution,
      )),
      '`',
    ),

    template_substitution: $ => seq(
      '${',
      $._expressions,
      '}',
    ),

    regex: $ => seq(
      '/',
      field('pattern', $.regex_pattern),
      token.immediate(prec(1, '/')),
      optional(field('flags', $.regex_flags)),
    ),

    regex_pattern: _ => token.immediate(prec(-1,
      repeat1(choice(
        seq(
          '[',
          repeat(choice(
            seq('\\', /./),
            /[^\]\n\\]/,
          )),
          ']',
        ),
        seq('\\', /./),
        /[^/\\\[\n]/,
      )),
    )),

    regex_flags: _ => token.immediate(/[a-z]+/),

    number: _ => {
      const hexLiteral = seq(
        choice('0x', '0X'),
        /[\da-fA-F]+/,
      );

      const decimalDigits = /\d+/;
      const signedInteger = seq(optional(choice('-', '+')), decimalDigits);
      const exponentPart = seq(choice('e', 'E'), signedInteger);

      const binaryLiteral = seq(choice('0b', '0B'), /[0-1]+/);

      const octalLiteral = seq(choice('0o', '0O'), /[0-7]+/);

      const decimalIntegerLiteral = choice(
        '0',
        seq(optional('0'), /[1-9]/, optional(decimalDigits)),
      );

      const decimalLiteral = choice(
        seq(decimalIntegerLiteral, '.', optional(decimalDigits), optional(exponentPart)),
        seq('.', decimalDigits, optional(exponentPart)),
        seq(decimalIntegerLiteral, exponentPart),
        decimalDigits,
      );

      return token(choice(
        hexLiteral,
        decimalLiteral,
        binaryLiteral,
        octalLiteral,
      ));
    },

    _identifier: $ => choice(
      $.undefined,
      $.identifier,
    ),

    identifier: _ => {
      const alpha = /[^\x00-\x1F\s\p{Zs}0-9:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/u;

      const alphanumeric = /[^\x00-\x1F\s\p{Zs}:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/u;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    meta_property: _ => seq('new', '.', 'target'),

    this: _ => 'this',
    super: _ => 'super',
    true: _ => 'true',
    false: _ => 'false',
    null: _ => 'null',
    undefined: _ => 'undefined',

    arguments: $ => seq(
      '(',
      optional(sepBy(',', choice($.expression, $.spread_element))),
      ')',
    ),

    class_body: $ => seq(
      '{',
      repeat(choice(
        seq(field('member', $.method_definition), optional(';')),
        ';',
      )),
      '}',
    ),

    formal_parameters: $ => seq(
      '(',
      optional(sepBy(',', $._formal_parameter)),
      ')',
    ),

    pattern: $ => prec.dynamic(-1, choice(
      $._lhs_expression,
      $.rest_pattern,
    )),

    rest_pattern: $ => prec.right(seq(
      '...',
      $._lhs_expression,
    )),

    method_definition: $ => seq(
      optional('static'),
      optional(choice('get', 'set', '*')),
      field('name', $._property_name),
      field('parameters', $.formal_parameters),
      field('body', $.statement_block),
    ),

    pair: $ => seq(
      field('key', $._property_name),
      ':',
      field('value', $.expression),
    ),

    pair_pattern: $ => seq(
      field('key', $._property_name),
      ':',
      field('value', choice($.pattern, $.assignment_pattern)),
    ),

    _property_name: $ => choice(
      alias(
        choice($.identifier, $._reserved_identifier),
        $.property_identifier,
      ),
      $.string,
      $.number,
      $.computed_property_name,
    ),

    computed_property_name: $ => seq(
      '[',
      $.expression,
      ']',
    ),

    _reserved_identifier: _ => choice(
      'get',
      'set',
      'static',
      'export',
      'let',
    ),

    _semicolon: $ => choice($._automatic_semicolon, ';'),
  },
});

function sepBy(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

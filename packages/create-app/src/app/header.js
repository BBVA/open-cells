/*
 * Copyright 2024 Bilbao Vizcaya Argentaria, S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import chalk from 'chalk';
import fs from 'fs';

const version = '1.0.0';

const R = chalk.rgb(226, 104, 102).bold;
const B = chalk.rgb(16, 33, 167).bold;
const C = chalk.rgb(101, 201, 204).bold;

export default `
${B('                            █████████████     ')}
${B('                        ███████████████████   ')}
${B('                    ██████████▓▒░   ░░▓█████  ')}
${B('                ██████████▓▒░          ░▓████ ')}
${B('            ██████████▓▒░      ')}${C('░░▒▒▒░░')}${B('   ▒████')}
${B('         █████████▓▒░         ')}${C('░▒▓▓▓▓▓▒░')}${B('   ████')}
${B('      ████████▓▒░             ')}${C('░▓▓▓▓▓▓▓░')}${B('   ████')}
${B('    ██████▓▒░                  ')}${C('▒▓▓▓▓▓░')}${B('   ░████')}
${B('   █████▓░   ')}${R('░░░░▒▒▒▒░░░░       ')}${C('░░░░░')}${B('   ░█████')}
${B('  █████░   ')}${R('░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░           ')}${B('░▓████ ')}
${B(' ████▓░  ')}${R('░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░          ')}${B('▓████  ')}
${B('█████░  ')}${R('░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░        ')}${B('▒████   ')}
${B('████▒   ')}${R('▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░      ')}${B('▒█████   ')}
${B('████   ')}${R('░▒▒▒▒▒▒▒▒░    ░▒▒▒▒▒▒▒▒░     ')}${B('░█████    ')}
${B('████   ')}${R('░▒▒▒▒▒▒▒░      ░▒▒▒▒▒▒▒▒    ')}${B('░█████     ')}
${B('████░  ')}${R('░▒▒▒▒▒▒▒▒░    ░▒▒▒▒▒▒▒▒░   ')}${B('░▓████      ')}
${B('████▒   ')}${R('▒▒▒▒▒▒▒▒▒▒░░░▒▒▒▒▒▒▒▒▒░   ')}${B('▓████       ')}
${B('█████░  ')}${R('░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░   ')}${B('▒████        ')}
${B('████▓   ')}${R('░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░   ')}${B('▒█████         ')}
${B('  ████▓░   ')}${R('░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░  ')}${B('░▓█████         ')}
${B('   █████▒░   ')}${R('░░░░▒▒▒▒░░░░    ')}${B('▒██████          ')}
${B('    ██████▒░              ░▒██████            ')}
${B('      ███████▓▒▒░░░░░░▒▒▓████████             ')}
${B('        ██████████████████████                ')}
${B('            ███████████████                   ')}
${'                                                '}
${'                                                '}
${'         Open Cells create-app v'}${version}${' '} 
${'                                                '}
${'             Make the web with Open Cells!      '}
`;

import {isRealSafari} from '#jsoe/utils/media.js';

describe('`isRealSafari`', function () {
  it('is true for an iPad/iPhone/iPod UA', function () {
    expect(isRealSafari(
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
        '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    )).to.equal(true);
  });

  it('is true for desktop Safari (Safari present, no Chrome/Chromium token)',
    function () {
      expect(isRealSafari(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 ' +
          'Safari/605.1.15'
      )).to.equal(true);
    });

  it(
    'is false for Chrome, even though its own UA also contains "Safari"',
    function () {
      expect(isRealSafari(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 ' +
          'Safari/537.36'
      )).to.equal(false);
    }
  );

  it('is false for Edge (Chromium-based, also contains "Safari")',
    function () {
      expect(isRealSafari(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      )).to.equal(false);
    });
});

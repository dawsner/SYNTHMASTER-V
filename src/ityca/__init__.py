"""I think you can AI it — daily AI-explainer video pipeline.

Package layout (one module per pipeline stage):

    scout        pick today's AI tool + the business pain it solves
    writer       fill the episode template -> EpisodeBrief
    demo         record a screen demo of the tool (Playwright)
    seaart       generate the talking-head avatar + voiceover (SeaArt)
    assembler    stitch clips + voice + captions into Short and Long (ffmpeg)
    publisher    upload to YouTube / Instagram / TikTok (official APIs)
    orchestrator run the whole day and stop at an approval package
"""

__version__ = "0.1.0"
